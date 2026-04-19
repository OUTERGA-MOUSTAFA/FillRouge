<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;
use Laravel\Reverb\Loggers\Log;

class MessagePolicy
{
    /**
     * Vérifier si l'utilisateur peut envoyer un message
     */
    public function send(User $user, User $receiver): bool
    {
        // Ne pas s'envoyer de message à soi-même
        if ($user->id === $receiver->id) {
            \Log::info('❌ Message bloqué: même utilisateur', ['user_id' => $user->id]);
            return false;
        }

        // Vérifier si l'utilisateur n'est pas bloqué
        if ($receiver->hasBlocked($user->id)) { 
                 \Log::info('❌ Message bloqué: utilisateur bloqué', [
                    'sender_id' => $user->id,
            'receiver_id' => $receiver->id
        ]);
            return false;
        }

        // Vérifier les limites de messages
    $canSend = $user->canSendMessage();
    
    \Log::info('🔍 Vérification envoi message', [
        'user_id' => $user->id,
        'subscription_plan' => $user->subscription_plan,
        'daily_messages_count' => $user->daily_messages_count,
        'last_message_reset_date' => $user->last_message_reset_date,
        'can_send' => $canSend
    ]);
    
    return $canSend;
    }

    // public function send(User $user, User $receiver): bool
    // {
    //     if ($user->id === $receiver->id) {
    //         Log::info('blocked: same user');
    //         return false;
    //     }

    //     if ($receiver->hasBlocked($user->id)) {
    //         Log::info('blocked: user is blocked');
    //         return false;
    //     }

    //     if (!$user->canSendMessage()) {
    //         Log::info('blocked: canSendMessage false', [
    //             'user_id' => $user->id,
    //             'subscription_plan' => $user->subscription_plan,
    //             'messages_count' => $user->messages_count,
    //         ]);
    //         return false;
    //     }

    //     return true;
    // }

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
