<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\MatchingService;
use App\Services\ImageService;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
     * Retourner les données de l'utilisateur connecté
     * Utilisé par le frontend pour afficher le profil et les statistiques
     */
    public function me(Request $request)
    {
        // Charger l'utilisateur avec ses relations (profil, avis, abonnement)
        // loadCount() compte les annonces et avis sans les charger entièrement → optimisation
        $user = $request->user()
            ->load([
                'profile',
                'reviews' => fn($q) => $q->where('is_visible', true)->latest(),
                'subscription'
            ])
            ->loadCount(['listings', 'reviews']);

        // Ajouter des données calculées dynamiquement (pas stockées en base)
        $user->remaining_messages = $user->getRemainingMessagesToday(); // messages restants aujourd'hui
        $user->remaining_ads      = $user->getRemainingAds();           // annonces restantes selon le plan
        $user->profile_completion = $user->profile
            ? $user->profile->getCompletionScore()
            : 0; // pourcentage de complétion du profil (0-100)
        $user->average_rating     = $user->reviews()->avg('rating') ?? 0;

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    /**
     * Mettre à jour les informations de base de l'utilisateur (table "users")
     * Nom, genre, date de naissance, profession, budget, téléphone
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validator::make(données_à_valider, règles)
        // 'sometimes' = valider seulement si le champ est présent dans la requête
        // 'nullable'  = le champ peut être vide/null
        // 'unique:users,phone,'.$user->id = le téléphone doit être unique SAUF pour cet utilisateur lui-même
        $validator = Validator::make($request->all(), [
            'full_name'  => 'sometimes|string|max:255',
            'gender'     => 'sometimes|in:male,female,other',
            'birth_date' => 'sometimes|date|before:today|after:1920-01-01',
            'profession' => 'nullable|string|max:255',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0|gte:budget_min', // gte = greater than or equal (>= budget_min)
            'phone'      => 'nullable|string|unique:users,phone,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422); // 422 = données invalides
        }

        // validated() retourne seulement les champs qui ont passé la validation
        // Évite d'injecter des champs non autorisés (ex: role, is_admin...)
        $user->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data'    => $user,
        ]);
    }

    /**
     * Mettre à jour les détails du profil (table "user_profiles")
     * Bio, ville, centres d'intérêt, mode de vie, préférences colocataire
     *
     * Différence avec updateProfile() :
     *   - updateProfile()        → modifie la table "users"
     *   - updateProfileDetails() → modifie la table "user_profiles" (relation hasOne)
     */
    public function updateProfileDetails(Request $request)
    {
        $user = $request->user();

        // crée un nouveau profil vide si l'utilisateur n'en a pas encore =>??
        $profile = $user->profile ?? new UserProfile(['user_id' => $user->id]);
        $validator = Validator::make($request->all(), [
            // Localisation
            'city'              => 'nullable|string|max:255',
            'neighborhood'      => 'nullable|string|max:255',

            // Description
            'bio'               => 'nullable|string|max:1000',
            'description'       => 'nullable|string|max:2000',

            // Centres d'intérêt (tableau de valeurs prédéfinies)
            'interests'         => 'nullable|array',
            'interests.*'       => 'string|in:cooking,fitness,tech,travel,study,remote_work,music,sports,reading,art,gaming,outdoors',

            // Mode de vie
            'smoking'           => 'nullable|in:yes,no,occasionally',
            'pets'              => 'nullable|in:yes,no,maybe',
            'sleep_schedule'    => 'nullable|in:early_bird,night_owl,flexible',
            'cleanliness'       => 'nullable|in:relaxed,moderate,very_clean',
            'social_level'      => 'nullable|in:introvert,ambivert,extrovert',
            'occupation'        => 'nullable|in:student,employed,self_employed,unemployed,retired',

            // Préférences pour le colocataire recherché
            'preferred_gender'  => 'nullable|in:male,female,any',
            'preferred_min_age' => 'nullable|integer|min:18|max:100',
            'preferred_max_age' => 'nullable|integer|min:18|max:100|gte:preferred_min_age',
            'accepts_pets'      => 'nullable|boolean',
            'accepts_smokers'   => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // fill() remplit le modèle avec les données validées sans sauvegarder
        // save() exécute INSERT (nouveau profil) ou UPDATE (profil existant)
        $profile->fill($validator->validated());
        $profile->save();

        // Recharger l'utilisateur avec son profil mis à jour
        $user->load('profile');

        return response()->json([
            'success' => true,
            'message' => 'Détails du profil mis à jour',
            'data'    => $user,
        ]);
    }

    /**
     * Upload de la photo de profil (avatar)
     * Remplace l'ancienne photo si elle existe
     */
    public function uploadAvatar(Request $request)
    {
        // 'image' = doit être une image (jpg, png, gif, bmp, svg, webp)
        // 'mimes' = types MIME autorisés spécifiquement
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048', //taille max en kilooctets (2MB)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Supprimer l'ancienne photo pour ne pas remplir le stockage inutilement
        if ($user->avatar) {
            $this->imageService->delete($user->avatar);
        }

        // imageService->upload() redimensionne et compresse l'image avant de la sauvegarder
        // Retourne l'URL image
        $url = $this->imageService->upload($request->file('avatar'), 'avatars');

        $user->update(['avatar' => $url]);

        return response()->json([
            'success' => true,
            'message' => 'Photo de profil mise à jour',
            'data'    => ['avatar' => $url],
        ]);
    }

    /**
     * Upload d'un document d'identité (CIN ou Passeport)
     * Le document est soumis pour vérification manuelle par un admin
     * L'utilisateur n'est PAS vérifié immédiatement — statut "pending_review"
     */
    public function uploadIdDocument(Request $request)
    {
        // 'file' au lieu de 'image' car on accepte aussi les PDF
        // 'mimes:jpeg,png,jpg,pdf' = images ET PDF acceptés
        // 'max:5120' = 5MB maximum
        $validator = Validator::make($request->all(), [
            'document'      => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'document_type' => 'required|in:cin,passport',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user    = $request->user();
        $profile = $user->profile ?? new UserProfile(['user_id' => $user->id]);

        // Supprimer l'ancien document si l'utilisateur en soumet un nouveau
        // parse_url() extrait le chemin de l'URL complète
        // str_replace() supprime le préfixe "/storage/" pour obtenir le chemin relatif
        if ($profile->id_document_path) {
            $oldPath = str_replace(
                Storage::disk('public')->url(''), // préfixe à supprimer
                '',
                $profile->id_document_path        // URL complète stockée en base
            );
            Storage::disk('public')->delete($oldPath);
        }

        // Générer un nom de fichier unique pour éviter les collisions
        // Format: id_[userId]_[timestamp].[extension]
        $file      = $request->file('document');
        $extension = $file->getClientOriginalExtension(); // 'jpg', 'pdf', etc.
        $filename  = 'id_' . $user->id . '_' . time() . '.' . $extension;

        // storeAs(dossier, nomFichier, disk) → sauvegarde dans storage/app/public/id_documents/
        // Storage::disk('public')->url($path) → retourne l'URL publique accessible depuis le navigateur
        $path = $file->storeAs('id_documents', $filename, 'public');
        $url  = Storage::disk('public')->url($path);

        // Sauvegarder le chemin et le type de document dans le profil
        $profile->id_document_path = $url;
        $profile->id_document_type = $request->document_type;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Document soumis pour vérification',
            'data'    => [
                'id_document_path' => $url,
                'id_document_type' => $request->document_type,
                'status'           => 'pending_review', // l'admin doit valider manuellement
            ],
        ]);
    }

    /**
     * Obtenir les recommandations de colocataires pour l'utilisateur connecté
     * Basé sur le score de compatibilité calculé par MatchingService
     */
    public function getRecommendations(Request $request)
    {
        $user = $request->user();

        // Impossible de calculer des recommandations sans profil complété
        if (!$user->profile) {
            return response()->json([
                'success'          => false,
                'message'          => 'Veuillez compléter votre profil pour recevoir des recommandations',
                'completion_score' => 0,
            ], 400);
        }

        $limit           = $request->get('limit', 10); // 10 recommandations par défaut
        $recommendations = $this->matchingService->getRecommendations($user, $limit);

        return response()->json([
            'success' => true,
            'data'    => $recommendations,
            'total'   => count($recommendations),
        ]);
    }

    /**
     * Calculer le score de compatibilité entre l'utilisateur connecté et un autre
     */
    public function getCompatibilityWith(Request $request, User $user)
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de calculer la compatibilité avec soi-même',
            ], 400);
        }

        // calculateCompatibility() retourne un score entre 0 et 100
        $score           = $this->matchingService->calculateCompatibility($currentUser, $user);
        $commonInterests = $this->matchingService->getCommonInterests($currentUser, $user);

        return response()->json([
            'success' => true,
            'data'    => [
                'user'                => $user->only(['id', 'full_name', 'avatar', 'age']),
                'compatibility_score' => $score,
                'common_interests'    => $commonInterests,
                'badges'              => $user->verification_badges,
            ],
        ]);
    }

    /**
     * Afficher le profil public d'un utilisateur (visible par tous)
     * Ne retourne PAS les données sensibles (email, téléphone, documents...)
     */
    public function show(User $user)
    {
        // Incrémenter le compteur de vues du profil
        $user->incrementProfileViews();

        $user->load([
            'profile',
            'reviews'  => fn($q) => $q->where('is_visible', true)->latest()->limit(10),
            'listings' => fn($q) => $q->where('status', 'active')->latest()->limit(5),
        ]);

        // only() sélectionne uniquement les champs autorisés pour un profil public
        // Les champs sensibles (email, phone, password...) sont exclus intentionnellement
        $publicData = $user->only([
            'id',
            'full_name',
            'avatar',
            'age',
            'gender',
            'profession',
            'created_at',
            'verification_badges',
        ]);

        // Ajouter les données calculées
        $publicData['profile']        = $user->profile;
        $publicData['average_rating'] = $user->average_rating;
        $publicData['reviews_count']  = $user->reviews()->where('is_visible', true)->count();
        $publicData['listings']       = $user->listings;
        $publicData['is_online']      = $user->isOnline(); // true si actif dans les 5 dernières minutes

        return response()->json([
            'success' => true,
            'data'    => $publicData,
        ]);
    }

    /**
     * Rechercher des utilisateurs avec filtres avancés
     * Accessible uniquement aux utilisateurs connectés
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query'        => 'nullable|string|min:2',
            'min_age'      => 'nullable|integer|min:18',
            'max_age'      => 'nullable|integer|max:100',
            'gender'       => 'nullable|in:male,female,other',
            'interests'    => 'nullable|array',
            'smoking'      => 'nullable|in:yes,no,occasionally',
            'pets'         => 'nullable|in:yes,no,maybe',
            'min_budget'   => 'nullable|numeric|min:0',
            'max_budget'   => 'nullable|numeric|min:0',
            'verified_only' => 'nullable|boolean',
            'premium_only' => 'nullable|boolean',
            'sort_by'      => 'nullable|in:relevance,rating,age,created_at',
            'per_page'     => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Construire la requête de base — exclure l'utilisateur connecté et les comptes supprimés
        $query = User::query()
            ->where('id', '!=', $request->user()->id)
            ->whereNull('deleted_at')
            ->whereNotNull('email_verified_at') // seulement les comptes vérifiés
            ->has('profile'); // seulement ceux qui ont un profil

        // Recherche par nom (LIKE = recherche partielle, insensible à la casse)
        if ($request->query) {
            $query->where('full_name', 'LIKE', "%{$request->query}%");
        }

        // Filtre par âge — on calcule la date de naissance correspondante
        if ($request->min_age) {
            $query->where('birth_date', '<=', now()->subYears($request->min_age)->format('Y-m-d'));
        }
        if ($request->max_age) {
            $query->where('birth_date', '>=', now()->subYears($request->max_age + 1)->format('Y-m-d'));
        }

        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

        // whereHas() filtre les users qui ONT un profil correspondant aux critères
        if ($request->interests) {
            $query->whereHas('profile', function ($q) use ($request) {
                foreach ($request->interests as $interest) {
                    // whereJsonContains() vérifie si le tableau JSON contient la valeur
                    $q->whereJsonContains('interests', $interest);
                }
            });
        }

        if ($request->smoking) {
            $query->whereHas('profile', fn($q) => $q->where('smoking', $request->smoking));
        }

        if ($request->pets) {
            $query->whereHas('profile', fn($q) => $q->where('pets', $request->pets));
        }

        // Filtre budget — cherche les users dont le budget chevauche la plage demandée
        if ($request->min_budget || $request->max_budget) {
            $query->where(function ($q) use ($request) {
                if ($request->min_budget) {
                    $q->where('budget_max', '>=', $request->min_budget);
                }
                if ($request->max_budget) {
                    $q->where('budget_min', '<=', $request->max_budget);
                }
            });
        }

        if ($request->verified_only) {
            $query->whereHas('profile', fn($q) => $q->where('is_identity_verified', true));
        }

        if ($request->premium_only) {
            $query->premium(); // scope défini dans User model
        }

        // Tri des résultats
        match ($request->sort_by) {
            'rating'     => $query->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc'),
            'age'        => $query->orderBy('birth_date', 'asc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        // paginate() divise les résultats en pages — évite de tout charger en mémoire
        $users = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * Mettre à jour les préférences de notification de l'utilisateur
     * Stockées en JSON dans la colonne notification_preferences de la table users
     */
    public function updateNotificationPreferences(Request $request)
    {
        // Validator::make(data, rules) crée une instance de validateur
        // 'boolean' = accepte true/false/1/0/"true"/"false"/"1"/"0"
        $validator = Validator::make($request->all(), [
            'email_messages'   => 'boolean',
            'email_matches'    => 'boolean',
            'email_promotions' => 'boolean',
            'sms_messages'     => 'boolean',
            'sms_matches'      => 'boolean',
            'push_messages'    => 'boolean',
            'push_matches'     => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Stocker les préférences sous forme de JSON dans la colonne notification_preferences
        // Le cast 'array' dans le modèle User gère la conversion JSON ↔ PHP automatiquement
        $user->notification_preferences = $validator->validated();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Préférences de notification mises à jour',
            'data'    => $user->notification_preferences,
        ]);
    }

    /**
     * Signaler un utilisateur à l'équipe de modération
     */
    public function reportUser(Request $request, User $user)
    {
        $reporter = $request->user();

        // Empêcher de se signaler soi-même
        if ($reporter->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas vous signaler vous-même',
            ], 400);
        }

        // Éviter les signalements en double pour le même utilisateur
        $existingReport = Report::where('reporter_id', $reporter->id)
            ->where('reported_user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà signalé cet utilisateur',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            // 'in:' = valeur doit être exactement une de ces options
            'reason' => 'required|string|in:spam,inappropriate_behavior,fake_profile,harassment,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Créer le signalement — l'admin le verra dans le dashboard sous "Signalements en attente"
        $report = Report::create([
            'reporter_id'      => $reporter->id,
            'reported_user_id' => $user->id,
            'reason'           => $request->reason,
            'status'           => 'pending', // en attente de traitement par un admin
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur signalé avec succès',
            'data'    => $report,
        ]);
    }
}
