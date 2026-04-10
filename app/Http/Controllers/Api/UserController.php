<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\MatchingService;
use App\Services\ImageService;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    protected $matchingService;
    protected $imageService;

    public function __construct(MatchingService $matchingService, ImageService $imageService)
    {
        $this->matchingService = $matchingService;
        $this->imageService = $imageService;
    }

    /**
     * Obtenir le profil de l'utilisateur connecté
     */
    public function me(Request $request)
    {
        $user = $request->user()->load([
            'profile',
            'reviews' => function($q) {
                $q->where('is_visible', true)->latest();
            },
            'subscription'
        ]);
        
        // Ajouter des métadonnées
        $user->remaining_messages = $user->getRemainingMessagesToday();
        $user->remaining_ads = $user->getRemainingAds();
        $user->profile_completion = $user->profile ? $user->profile->getCompletionScore() : 0;
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,other',
            'birth_date' => 'sometimes|date|before:today|after:1920-01-01',
            'profession' => 'nullable|string|max:255',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0|gte:budget_min',
            'phone' => 'sometimes|string|unique:users,phone|required|regex:/^(\+212|0)[5-7][0-9]{8}$/' . $user->id,
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user->update($validator->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour les détails du profil étendu
     */
    public function updateProfileDetails(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile ?: new UserProfile(['user_id' => $user->id]);
        
        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'interests' => 'nullable|array',
            'interests.*' => 'string|in:cooking,fitness,tech,travel,study,remote_work,music,sports,reading,art,gaming,outdoors',
            'smoking' => 'nullable|in:yes,no,occasionally',
            'pets' => 'nullable|in:yes,no,maybe',
            'sleep_schedule' => 'nullable|in:early_bird,night_owl,flexible',
            'cleanliness' => 'nullable|in:relaxed,moderate,very_clean',
            'social_level' => 'nullable|in:introvert,ambivert,extrovert',
            'occupation' => 'nullable|in:student,employed,self_employed,unemployed,retired',
            'preferred_gender' => 'nullable|in:male,female,any',
            'preferred_min_age' => 'nullable|integer|min:18|max:100',
            'preferred_max_age' => 'nullable|integer|min:18|max:100|gte:preferred_min_age',
            'accepts_pets' => 'nullable|boolean',
            'accepts_smokers' => 'nullable|boolean',
            'city' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $profile->fill($validator->validated());
        $profile->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Détails du profil mis à jour',
            'data' => $profile
        ]);
    }

    /**
     * Upload de photo de profil
     */
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Supprimer l'ancienne photo si elle existe
        if ($user->avatar) {
            $this->imageService->delete($user->avatar);
        }
        
        // Upload de la nouvelle photo
        $path = $this->imageService->upload($request->file('avatar'), 'avatars');
        
        $user->update(['avatar' => $path]);
        
        return response()->json([
            'success' => true,
            'message' => 'Photo de profil mise à jour',
            'data' => ['avatar' => $path]
        ]);
    }

    /**
     * Upload de document d'identité (CIN/Passport)
     * le système de vérification d'identité (CIN)"
     */
    public function uploadIdDocument(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120',
            'document_type' => 'required|in:cin,passport'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Upload du document
        $path = $this->imageService->upload($request->file('document'), 'identity_documents');
        
        // Mettre à jour le profil
        $user->profile->verifyIdentity($path, $request->document_type);
        
        return response()->json([
            'success' => true,
            'message' => 'Document d\'identité soumis pour vérification',
            'data' => [
                'document_path' => $path,
                'document_type' => $request->document_type,
                'status' => 'pending_review'
            ]
        ]);
    }

    /**
     * Obtenir les recommandations de colocataires
     */
    public function getRecommendations(Request $request)
    {
        $user = $request->user();
        
        // Vérifier si l'utilisateur a un profil complet
        if (!$user->profile || $user->profile->getCompletionScore() < 60) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez compléter votre profil pour recevoir des recommandations',
                'completion_score' => $user->profile ? $user->profile->getCompletionScore() : 0
            ], 400);
        }
        
        $limit = $request->get('limit', 10);
        $recommendations = $this->matchingService->getRecommendations($user, $limit);
        
        return response()->json([
            'success' => true,
            'data' => $recommendations,
            'total' => count($recommendations)
        ]);
    }

    /**
     * Obtenir le score de compatibilité avec un autre utilisateur
     */
    public function getCompatibilityWith(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        if ($currentUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de calculer la compatibilité avec soi-même'
            ], 400);
        }
        
        $score = $this->matchingService->calculateCompatibility($currentUser, $user);
        $commonInterests = $this->matchingService->getCommonInterests($currentUser, $user);
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->only(['id', 'full_name', 'avatar', 'age']),
                'compatibility_score' => $score,
                'common_interests' => $commonInterests,
                'badges' => $user->verification_badges
            ]
        ]);
    }

    /**
     * Obtenir le profil public d'un utilisateur
     */
    public function show(User $user)
    {
        // Incrémenter les vues
        $user->incrementProfileViews();
        
        $user->load([
            'profile',
            'reviews' => function($q) {
                $q->where('is_visible', true)->latest()->limit(10);
            },
            'listings' => function($q) {
                $q->where('status', 'active')->latest()->limit(5);
            }
        ]);
        
        // Ne pas inclure les informations privées
        $publicData = $user->only([
            'id', 'full_name', 'avatar', 'age', 'gender', 'profession',
            'created_at', 'verification_badges'
        ]);
        
        $publicData['profile'] = $user->profile;
        $publicData['average_rating'] = $user->average_rating;
        $publicData['reviews_count'] = $user->reviews()->where('is_visible', true)->count();
        $publicData['listings'] = $user->listings;
        $publicData['is_online'] = $user->isOnline();
        
        return response()->json([
            'success' => true,
            'data' => $publicData
        ]);
    }

    /**
     * Rechercher des utilisateurs
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'nullable|string|min:2',
            'city' => 'nullable|string',
            'min_age' => 'nullable|integer|min:18',
            'max_age' => 'nullable|integer|max:100',
            'gender' => 'nullable|in:male,female,other',
            'interests' => 'nullable|array',
            'smoking' => 'nullable|in:yes,no,occasionally',
            'pets' => 'nullable|in:yes,no,maybe',
            'min_budget' => 'nullable|numeric|min:0',
            'max_budget' => 'nullable|numeric|min:0',
            'verified_only' => 'nullable|boolean',
            'premium_only' => 'nullable|boolean',
            'sort_by' => 'nullable|in:relevance,rating,age,created_at',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $query = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where('deleted_at', null)
            ->whereNotNull('email_verified_at')
            ->has('profile');
        
        // Recherche par nom
        if ($request->query) {
            $query->where('full_name', 'LIKE', "%{$request->query}%");
        }
        
        // Ville
        if ($request->city) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('city', 'LIKE', "%{$request->city}%");
            });
        }
        
        // Âge
        if ($request->min_age) {
            $birthDateMax = now()->subYears($request->min_age)->format('Y-m-d');
            $query->where('birth_date', '<=', $birthDateMax);
        }
        
        if ($request->max_age) {
            $birthDateMin = now()->subYears($request->max_age + 1)->format('Y-m-d');
            $query->where('birth_date', '>=', $birthDateMin);
        }
        
        // Genre
        if ($request->gender) {
            $query->where('gender', $request->gender);
        }
        
        // Centres d'intérêt
        if ($request->interests) {
            $query->whereHas('profile', function($q) use ($request) {
                foreach ($request->interests as $interest) {
                    $q->whereJsonContains('interests', $interest);
                }
            });
        }
        
        // Mode de vie
        if ($request->smoking) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('smoking', $request->smoking);
            });
        }
        
        if ($request->pets) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('pets', $request->pets);
            });
        }
        
        // Budget
        if ($request->min_budget || $request->max_budget) {
            $query->where(function($q) use ($request) {
                if ($request->min_budget) {
                    $q->where('budget_max', '>=', $request->min_budget);
                }
                if ($request->max_budget) {
                    $q->where('budget_min', '<=', $request->max_budget);
                }
            });
        }
        
        // Filtres spéciaux
        if ($request->verified_only) {
            $query->whereHas('profile', function($q) {
                $q->where('is_identity_verified', true);
            });
        }
        
        if ($request->premium_only) {
            $query->premium();
        }
        
        // Tri
        switch ($request->sort_by) {
            case 'rating':
                $query->withAvg('reviews', 'rating')
                      ->orderBy('reviews_avg_rating', 'desc');
                break;
            case 'age':
                $query->orderBy('birth_date', 'asc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }
        
        $perPage = $request->per_page ?? 20;
        $users = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Mettre à jour les préférences de notification
     */
    public function updateNotificationPreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_messages' => 'boolean',
            'email_matches' => 'boolean',
            'email_promotions' => 'boolean',
            'sms_messages' => 'boolean',
            'sms_matches' => 'boolean',
            'push_messages' => 'boolean',
            'push_matches' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Stocker les préférences dans la table notifications_settings
        $user->notification_preferences = $validator->validated();
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Préférences de notification mises à jour',
            'data' => $user->notification_preferences
        ]);
    }

    /**
     * Supprimer le compte utilisateur
     */
    // public function deleteAccount(Request $request)
    // {
    //     $user = $request->user();
        
    //     $validator = Validator::make($request->all(), [
    //         'password' => 'required|string'
    //     ]);
        
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'success' => false,
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }
        
    //     if (!Hash::check($request->password, $user->password)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Mot de passe incorrect'
    //         ], 401);
    //     }
        
    //     // Supprimer les fichiers associés
    //     if ($user->avatar) {
    //         $this->imageService->delete($user->avatar);
    //     }
        
    //     if ($user->profile && $user->profile->id_document_path) {
    //         $this->imageService->delete($user->profile->id_document_path);
    //     }
        
    //     // Soft delete
    //     $user->delete();
        
    //     // Révoquer les tokens
    //     $user->tokens()->delete();
        
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Compte supprimé avec succès'
    //     ]);
    // }

    /**
     * Signaler un utilisateur
     */
    public function reportUser(Request $request, User $user)
    {
        $reporter = $request->user();

        // Vérifier si déjà signalé
        $existingReport = Report::where('reporter_id', $reporter->id)
            ->where('reported_user_id', $user->id)
            ->where('status', 'pending')
            ->first();
        
        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà signalé cet utilisateur'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|in:spam,inappropriate_behavior,fake_profile,harassment,other',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        
        if ($reporter->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas vous signaler vous-même'
            ], 400);
        }
        
        $report = Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $user->id,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur signalé avec succès',
            'data' => $report
        ]);
    }
}