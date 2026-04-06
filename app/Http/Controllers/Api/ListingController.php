<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Gate;

class ListingController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Liste des annonces (publique)
     */
    public function index(Request $request)
    {
        $query = Listing::active()->with('user');

        // Filtres
        if ($request->city) {
            $query->byCity($request->city);
        }

        if ($request->min_price && $request->max_price) {
            $query->byPriceRange($request->min_price, $request->max_price);
        }

        if ($request->type) {
            $query->byType($request->type);
        }

        if ($request->amenities) {
            $query->byAmenities(explode(',', $request->amenities));
        }

        // Tri
        $sort = $request->sort ?? 'latest';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'featured':
                $query->featured()->orderBy('featured_until', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->per_page ?? 20;
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $listings
        ]);
    }

    /**
     * Afficher une annonce
     */
    public function show(Listing $listing)
    {
        if (!Gate::allows('view', $listing)) {
            return response()->json([
                'success' => false,
                'message' => 'Annance non disponible'
            ], 403);
        }

        // Incrémenter les vues
        $listing->incrementViews();

        $listing->load(['user', 'user.profile', 'reviews']);

        return response()->json([
            'success' => true,
            'data' => $listing
        ]);
    }

    /**
     * Créer une annonce
     */
    public function store(Request $request)
    {
        if (!Gate::allows('create', Listing::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez atteint la limite d\'annonces autorisée.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:room,apartment,looking_for_roommate',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'price_is_negotiable' => 'boolean',
            'available_from' => 'required|date',
            'available_until' => 'nullable|date|after:available_from',
            'city' => 'required|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'furnished' => 'boolean',
            'amenities' => 'nullable|array',
            'house_rules' => 'nullable|array',
            'photos' => 'required|array|min:3|max:10',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Upload des photos
        $photos = [];
        $mainPhoto = null;

        foreach ($request->file('photos') as $index => $photo) {
            $path = $this->imageService->upload($photo, 'listings');
            $photos[] = $path;
            
            if ($index === 0) {
                $mainPhoto = $path;
            }
        }

        $listing = Listing::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'price_is_negotiable' => $request->price_is_negotiable ?? false,
            'available_from' => $request->available_from,
            'available_until' => $request->available_until,
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'furnished' => $request->furnished ?? false,
            'amenities' => $request->amenities,
            'house_rules' => $request->house_rules,
            'photos' => $photos,
            'main_photo' => $mainPhoto,
            'status' => 'active',
        ]);

        // Décrémenter le compteur d'annonces restantes
        $user->decrement('remaining_ads');

        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès',
            'data' => $listing
        ], 201);
    }

    /**
     * Mettre à jour une annonce
     */
    public function update(Request $request, Listing $listing)
    {
        if (!Gate::allows('update', $listing)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cette annonce'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'price_is_negotiable' => 'boolean',
            'available_from' => 'sometimes|date',
            'available_until' => 'nullable|date|after:available_from',
            'city' => 'sometimes|string|max:255',
            'neighborhood' => 'nullable|string',
            'address' => 'nullable|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'furnished' => 'boolean',
            'amenities' => 'nullable|array',
            'house_rules' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $listing->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Annonce mise à jour',
            'data' => $listing
        ]);
    }

    /**
     * Supprimer une annonce
     */
    public function destroy(Listing $listing)
    {
        if (!Gate::allows('delete', $listing)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        // Supprimer les photos
        foreach ($listing->photos as $photo) {
            $this->imageService->delete($photo);
        }

        $listing->delete();

        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée'
        ]);
    }

    /**
     * Activer/Désactiver une annonce
     */
    // public function toggleStatus(Listing $listing)
    // {
    //     if (!Gate::allows('update', $listing)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Non autorisé'
    //         ], 403);
    //     }

    //     $newStatus = $listing->status === 'active' ? 'inactive' : 'active';
    //     $listing->update(['status' => $newStatus]);

    //     return response()->json([
    //         'success' => true,
    //         'message' => $newStatus === 'active' ? 'Annonce activée' : 'Annonce désactivée',
    //         'status' => $newStatus
    //     ]);
    // }

    /**
     * Mettre en avant une annonce (premium)
     */
    // public function makeFeatured(Request $request, Listing $listing)
    // {
    //     if (!Gate::allows('feature', $listing)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Fonctionnalité premium uniquement'
    //         ], 403);
    //     }

    //     $days = $request->days ?? 7;
    //     $listing->makeFeatured($days);

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Annonce mise en avant pour ' . $days . ' jours',
    //         'featured_until' => $listing->featured_until
    //     ]);
    // }

    /**
     * Mes annonces
     */
    public function myListings(Request $request)
    {
        $listings = $request->user()
            ->listings()
            ->withCount('messages')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $listings
        ]);
    }

    /**
     * Recherche avancée
     */
    public function search(Request $request)
    {
        $query = Listing::active()->with('user');

        // Recherche par texte
        if ($request->q) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->q}%")
                  ->orWhere('description', 'LIKE', "%{$request->q}%")
                  ->orWhere('city', 'LIKE', "%{$request->q}%")
                  ->orWhere('neighborhood', 'LIKE', "%{$request->q}%");
            });
        }

    //     // Filtres avancés
    //     if ($request->city) $query->byCity($request->city);
    //     if ($request->min_price) $query->where('price', '>=', $request->min_price);
    //     if ($request->max_price) $query->where('price', '<=', $request->max_price);
    //     if ($request->type) $query->byType($request->type);
    //     if ($request->furnished !== null) $query->where('furnished', $request->furnished);
    //     if ($request->bedrooms) $query->where('bedrooms', '>=', $request->bedrooms);
        
    //     if ($request->amenities) {
    //         $amenities = explode(',', $request->amenities);
    //         $query->byAmenities($amenities);
    //     }

    //     // Rayon de recherche (km)
    //     if ($request->lat && $request->lng && $request->radius) {
    //         $query->whereRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?", [
    //             $request->lat, $request->lng, $request->lat, $request->radius
    //         ]);
    //     }

    //     $perPage = $request->per_page ?? 20;
    //     $listings = $query->paginate($perPage);

    //     return response()->json([
    //         'success' => true,
    //         'data' => $listings,
    //         'filters' => $request->all()
    //     ]);
    // }
}