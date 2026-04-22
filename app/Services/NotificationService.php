<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    // SmsService supprimé — à ajouter plus tard quand SMS sera implémenté

    /**
     * Créer et envoyer une notification
     *
     * @param User   $user    Le destinataire
     * @param string $type    Type: 'message', 'match', 'listing_match', 'subscription_expiring', 'profile_reminder'
     * @param string $title   Titre affiché dans la notification
     * @param string $content Corps du message
     * @param array  $data    Données supplémentaires (IDs, scores...) stockées en JSON
     */
    public function send(User $user, string $type, string $title, string $content, array $data = []): Notification
    {
        // Récupérer les préférences de notification de l'utilisateur
        // Si pas de préférences → comportement par défaut (email activé)
        $preferences = $user->notification_preferences ?? [];

        // Déterminer les canaux d'envoi AVANT de créer la notification
        $sentVia = [];

        // Canal email — activé par défaut sauf si désactivé explicitement
        $emailKey = 'email_' . $type; // ex: 'email_message', 'email_match'
        $emailEnabled = $preferences[$emailKey] ?? true;

        if ($emailEnabled && $user->email_verified_at) {
            try {
                $this->sendEmail($user, $title, $content, $data);
                $sentVia[] = 'email';
            } catch (\Exception $e) {
                // L'email échoue → on continue quand même, la notif in-app sera créée
                Log::warning('Email notification failed', [
                    'user_id' => $user->id,
                    'type'    => $type,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        // Canal SMS — désactivé par défaut (nécessite SmsService)
        // $smsKey = 'sms_' . $type;
        // if (($preferences[$smsKey] ?? false) && $user->phone_verified_at) {
        //     $this->smsService->send($user->phone, $content);
        //     $sentVia[] = 'sms';
        // }

        // Stocker la notification en base de données (notification in-app)
        // sent_via est passé directement à create() → le cast JSON le sérialise correctement
        $notification = Notification::create([
            'user_id'  => $user->id,
            'type'     => $type,
            'title'    => $title,
            'content'  => $content,
            'data'     => $data,
            'is_read'  => false,
            'sent_via' => $sentVia,
        ]);

        return $notification;
    }

    /**
     * Envoyer un email de notification
     * Utilise le template resources/views/emails/notification.blade.php
     */
    protected function sendEmail(User $user, string $title, string $content, array $data): void
    {
        Mail::send(
            'emails.notification',
            ['user' => $user, 'title' => $title, 'content' => $content, 'data' => $data],
            function ($message) use ($user, $title) {
                $message->to($user->email)->subject($title);
            }
        );
    }

    // ══════════════════════════════════════════════════════════════════
    // Méthodes de haut niveau — appelées depuis les controllers
    // ══════════════════════════════════════════════════════════════════

    /**
     * Notification de nouveau message reçu
     * Appelée depuis MessageController::send()
     */
    public function newMessage(User $receiver, User $sender, $message): Notification
    {
        return $this->send(
            $receiver,
            'message',
            'Nouveau message de ' . $sender->full_name,
            // Tronquer le contenu si trop long
            mb_strlen($message->content) > 100
                ? mb_substr($message->content, 0, 100) . '…'
                : ($message->content ?: '📎 Image'),
            [
                'sender_id'  => $sender->id,
                'message_id' => $message->id,
            ]
        );
    }

    /**
     * Notification de nouveau match de compatibilité
     * Appelée depuis MatchController ou MatchingService
     */
    public function newMatch(User $user, User $matchedUser, float $score): Notification
    {
        return $this->send(
            $user,
            'match',
            'Nouveau match trouvé !',
            'Vous avez un match avec ' . $matchedUser->full_name . ' — Compatibilité : ' . round($score) . '%',
            [
                'matched_user_id'     => $matchedUser->id,
                'compatibility_score' => $score,
            ]
        );
    }

    /**
     * Notification d'une annonce correspondant aux critères de recherche
     */
    public function newMatchingListing(User $user, $listing): Notification
    {
        return $this->send(
            $user,
            'listing_match',
            'Nouvelle annonce pour vous',
            'Une annonce correspond à vos critères : ' . $listing->title . ' — ' . $listing->city,
            ['listing_id' => $listing->id]
        );
    }

    /**
     * Rappel d'expiration d'abonnement
     * À appeler depuis un job/commande artisan planifiée
     */
    public function subscriptionExpiring(User $user, int $daysLeft): Notification
    {
        return $this->send(
            $user,
            'subscription_expiring',
            'Abonnement expire dans ' . $daysLeft . ' jour' . ($daysLeft > 1 ? 's' : ''),
            "Votre abonnement premium expirera dans {$daysLeft} jour(s). Renouvelez pour continuer à profiter de tous les avantages.",
            ['days_left' => $daysLeft]
        );
    }

    /**
     * Rappel de complétion du profil
     * À appeler depuis un job planifié (ex: 3 jours après inscription)
     */
    public function profileIncomplete(User $user, int $completionScore): Notification
    {
        return $this->send(
            $user,
            'profile_reminder',
            'Complétez votre profil',
            "Votre profil est complété à {$completionScore}%. Un profil complet augmente vos chances de trouver un colocataire !",
            ['completion_score' => $completionScore]
        );
    }

    /**
     * Notification de demande de location reçue (pour le semsar)
     * Appelée quand un chercheur envoie une demande via le RentModal
     */
    public function rentRequest(User $semsar, User $chercheur, $listing): Notification
    {
        return $this->send(
            $semsar,
            'message',
            $chercheur->full_name . ' est intéressé(e) par votre annonce',
            'Demande de location pour : ' . $listing->title,
            [
                'sender_id'  => $chercheur->id,
                'listing_id' => $listing->id,
            ]
        );
    }
}