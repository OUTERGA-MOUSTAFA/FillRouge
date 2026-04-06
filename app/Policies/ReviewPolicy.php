<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    /**
     * Vérifier si l'utilisateur peut laisser un avis
     */
    public function create(User $user, User $reviewed): bool
    {
        // Ne pas s'évaluer soi-même
        if ($user->id === $reviewed->id) {
            return false;
        }
        
        // Vérifier s'il y a eu une interaction (message ou location)
        $hasInteraction = $user->sentMessages()
            ->where('receiver_id', $reviewed->id)
            ->exists() || 
            $user->receivedMessages()
            ->where('sender_id', $reviewed->id)
            ->exists();
        
        return $hasInteraction;
    }

    /**
     * Modifier un avis
     */
    public function update(User $user, Review $review): bool
    {
        // Seulement l'auteur peut modifier, et dans les 48h
        return $user->id === $review->reviewer_id && $review->canBeEdited();
    }

    /**
     * Supprimer un avis
     */
    public function delete(User $user, Review $review): bool
    {
        // L'auteur ou l'administrateur peut supprimer
        return $user->id === $review->reviewer_id || $user->isAdmin();
    }
}