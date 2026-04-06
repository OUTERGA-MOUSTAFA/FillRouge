<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Voir le profil
     */
    public function view(User $currentUser, User $user): bool
    {
        // Les profils des utilisateurs actifs sont publics
        return $user->deleted_at === null;
    }

    /**
     * Mettre à jour le profil
     */
    public function update(User $currentUser, User $user): bool
    {
        return $currentUser->id === $user->id;
    }

    /**
     * Signaler un utilisateur
     */
    public function report(User $currentUser, User $user): bool
    {
        // Ne pas se signaler soi-même
        if ($currentUser->id === $user->id) {
            return false;
        }
        
        // Vérifier s'il n'a pas déjà été signalé
        $alreadyReported = $currentUser->sentReports()
            ->where('reported_user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
        
        return !$alreadyReported;
    }

    /**
     * Bloquer un utilisateur
     */
    public function block(User $currentUser, User $user): bool
    {
        // Ne pas se bloquer soi-même
        return $currentUser->id !== $user->id;
    }
}