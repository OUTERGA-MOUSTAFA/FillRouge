<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * Vérifier si l'utilisateur peut créer une annonce
     * Seulement les utilisateurs avec role 'semsar' ou 'admin'
     */
    public function create(User $user): bool
    {
        // Vérifier si l'utilisateur a le rôle semsar
        if (!in_array($user->role, ['semsar'])) {
            return false;
        }
        
        // Vérifier la limite d'annonces
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
        
        // Le propriétaire (semsar) peut voir ses annonces même inactives
        if ($user->id === $listing->user_id && $user->role === 'semsar') {
            return true;
        }
        
        // L'admin peut voir toutes les annonces
        return $user->role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur peut modifier l'annonce
     * Seulement le semsar qui l'a créée ou l'admin
     */
    public function update(User $user, Listing $listing): bool
    {
        // Le semsar propriétaire peut modifier son annonce
        if ($user->id === $listing->user_id && $user->role === 'semsar') {
            return true;
        }
        
        // L'admin peut modifier toutes les annonces
        return $user->role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur peut supprimer l'annonce
     * Seulement le semsar qui l'a créée ou l'admin
     */
    public function delete(User $user, Listing $listing): bool
    {
        // Le semsar propriétaire peut supprimer son annonce
        if ($user->id === $listing->user_id && $user->role === 'semsar') {
            return true;
        }
        
        // L'admin peut supprimer toutes les annonces
        return $user->role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur peut activer/désactiver l'annonce
     * Seulement le semsar qui l'a créée ou l'admin
     */
    public function toggleStatus(User $user, Listing $listing): bool
    {
        // Le semsar propriétaire peut activer/désactiver son annonce
        if ($user->id === $listing->user_id && $user->role === 'semsar') {
            return true;
        }
        
        // L'admin peut activer/désactiver toutes les annonces
        return $user->role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur peut mettre en avant l'annonce
     */
    public function feature(User $user, Listing $listing): bool
    {
        // Seulement le semsar propriétaire premium peut mettre en avant
        if ($user->id === $listing->user_id && $user->is_premium && $user->role === 'semsar') {
            return true;
        }
        
        // L'admin peut mettre en avant n'importe quelle annonce
        return $user->role === 'admin';
    }
}