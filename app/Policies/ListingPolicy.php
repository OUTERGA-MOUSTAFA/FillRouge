<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * Vérifier si l'utilisateur peut créer une annonce
     */
    public function create(User $user): bool
    {
        return $user->canCreateListing();
    }

    /**
     * Vérifier si l'utilisateur peut voir l'annonce
     */
    public function view(User $user, Listing $listing): bool
    {
        // Les annonces actives sont visibles par tous
        if ($listing->status === 'active') {
            return true;
        }
        
        // Le propriétaire peut voir ses annonces même inactives
        return $user->id === $listing->user_id;
    }

    /**
     * Vérifier si l'utilisateur peut modifier l'annonce
     */
    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    /**
     * Vérifier si l'utilisateur peut supprimer l'annonce
     */
    public function delete(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    /**
     * Vérifier si l'utilisateur peut mettre en avant l'annonce
     */
    public function feature(User $user, Listing $listing): bool
    {
        // Seulement les utilisateurs premium peuvent mettre en avant
        return $user->id === $listing->user_id && $user->is_premium;
    }
}