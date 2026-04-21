<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;
use Illuminate\Auth\Access\Response;

// use Illuminate\Support\Facades\Log as FacadesLog;
// use Laravel\Reverb\Loggers\Log;

class MessagePolicy
{
    /**
     * Vérifier si l'utilisateur peut envoyer un message
     */
    // public function send(User $user, User $receiver): bool
    // {
    //     // Can't message yourself
    //     if ($user->id === $receiver->id) {
    //         return false;
    //     }

    //     // Can't message an admin
    //     if ($receiver->role === 'admin') {
    //         return false;
    //     }

    //     // Blocked check
    //     if ($receiver->hasBlocked($user->id)) {
    //         return false;
    //     }

    //     // Admin can message anyone
    //     if ($user->role === 'admin') {
    //         return true;
    //     }

    //     // Semsar can reply to chercheurs who already messaged them
    //     // (no limit on replies — they're responding to inquiries)
    //     if ($user->role === 'semsar') {
    //         $alreadyContacted = \App\Models\Message::where('sender_id', $receiver->id)
    //             ->where('receiver_id', $user->id)
    //             ->exists();

    //         if (!$alreadyContacted) {
    //             return false; // semsar can't cold-message chercheurs
    //         }

    //         return true;
    //     }

    //     // Chercheur — check daily message limit
    //     if ($user->role === 'chercheur') {
    //         // Chercheur can only message semsar (not other chercheurs)
    //         if ($receiver->role !== 'semsar') {
    //             return false;
    //         }

    //         return $user->canSendMessage();
    //     }

    //     return false;
    // }
    // 1. نفس الشخص
    public function send(User $user, User $receiver)
    {
        if ($user->id === $receiver->id) {
            return Response::deny("Vous ne pouvez pas vous envoyer de message.");
        }

        // 2. المراسلة للأدمن
        if ($receiver->role === 'admin') {
            return Response::deny("Vous ne pouvez pas contacter un administrateur.");
        }

        // 3. البلوك
        if ($receiver->hasBlocked($user->id)) {
            return Response::deny("Cet utilisateur vous a bloqué.");
        }

        // 4. الأدمن يقدر يصيفط لأي حد
        if ($user->role === 'admin') {
            return Response::allow();
        }

        // 5. قوانين السمسار
        if ($user->role === 'semsar') {
            $alreadyContacted = \App\Models\Message::where('sender_id', $receiver->id)
                ->where('receiver_id', $user->id)
                ->exists();

            if (!$alreadyContacted) {
                return Response::deny("Vous ne pouvez répondre qu'aux personnes qui vous ont contacté.");
            }
            return Response::allow();
        }

        // 6. قوانين الباحث (Chercheur)
        if ($user->role === 'chercheur') {
            if ($receiver->role !== 'semsar') {
                return Response::deny("Vous ne pouvez contacter que des semsars.");
            }

            if (!$user->canSendMessage()) {
                return Response::deny("Limite de messages atteinte.");
            }

            return Response::allow();
        }

        // الحالة الافتراضية للمنع
        return Response::deny("Action non autorisée.");
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
