<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;
// use Illuminate\Support\Facades\Log as FacadesLog;
// use Laravel\Reverb\Loggers\Log;

class MessagePolicy
{
    /**
     * Vérifier si l'utilisateur peut envoyer un message
     */
    public function send(User $user, User $receiver): bool
    {
        // Can't message yourself
        if ($user->id === $receiver->id) {
            return false;
        }

        // Can't message an admin
        if ($receiver->role === 'admin') {
            return false;
        }

        // Blocked check
        if ($receiver->hasBlocked($user->id)) {
            return false;
        }

        // Admin can message anyone
        if ($user->role === 'admin') {
            return true;
        }

        // Semsar can reply to chercheurs who already messaged them
        // (no limit on replies — they're responding to inquiries)
        if ($user->role === 'semsar') {
            $alreadyContacted = \App\Models\Message::where('sender_id', $receiver->id)
                ->where('receiver_id', $user->id)
                ->exists();

            if (!$alreadyContacted) {
                return false; // semsar can't cold-message chercheurs
            }

            return true;
        }

        // Chercheur — check daily message limit
        if ($user->role === 'chercheur') {
            // Chercheur can only message semsar (not other chercheurs)
            if ($receiver->role !== 'semsar') {
                return false;
            }

            return $user->canSendMessage();
        }

        return false;
    }

    // public function send(User $user, User $receiver): bool
    // {
    //     if ($user->id === $receiver->id) {
    //         FacadesLog::info('blocked: same user');
    //         return false;
    //     }

    //     if ($receiver->hasBlocked($user->id)) {
    //         FacadesLog::info('blocked: user is blocked');
    //         return false;
    //     }

    //     if (!$user->canSendMessage()) {
    //         FacadesLog::info('blocked: canSendMessage false', [
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
