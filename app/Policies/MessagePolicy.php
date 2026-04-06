<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    /**
     * Vérifier si l'utilisateur peut envoyer un message
     */
    public function send(User $user, User $receiver): bool
    {
        // Ne pas s'envoyer de message à soi-même
        if ($user->id === $receiver->id) {
            return false;
        }
        
        // Vérifier si l'utilisateur n'est pas bloqué
        if ($receiver->hasBlocked($user->id)) {
            return false;
        }
        
        // Vérifier les limites de messages
        return $user->canSendMessage();
    }

    /**
     * Voir le message
     */
    public function view(User $user, Message $message): bool
    {
        return $user->id === $message->sender_id || 
               $user->id === $message->receiver_id;
    }

    /**
     * Supprimer le message
     */
    public function delete(User $user, Message $message): bool
    {
        return $user->id === $message->sender_id || 
               $user->id === $message->receiver_id;
    }

    /**
     * Signaler le message
     */
    public function report(User $user, Message $message): bool
    {
        // Seulement le destinataire peut signaler
        return $user->id === $message->receiver_id && !$message->is_reported;
    }
}