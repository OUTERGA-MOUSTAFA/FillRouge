<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

/**
 * Gestion des favoris du chercheur.
 */
class FavoriteController extends Controller
{
    /**
     * Liste des annonces favorites de l'utilisateur connecté (plus récentes d'abord).
     */
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('user')
            ->orderByDesc('favorites.created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $favorites,
        ]);
    }

    /**
     * Ajoute ou retire une annonce des favoris (toggle atomique via la table pivot).
     */
    public function toggle(Request $request, Listing $listing)
    {
        $result    = $request->user()->favorites()->toggle($listing->id);
        $favorited = count($result['attached']) > 0;

        return response()->json([
            'success'   => true,
            'favorited' => $favorited,
            'message'   => $favorited
                ? __('messages.favorite.added')
                : __('messages.favorite.removed'),
        ]);
    }
}
