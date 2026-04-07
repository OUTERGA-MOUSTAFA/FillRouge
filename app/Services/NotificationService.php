<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    protected $smsService;
    
    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }
    
    /**
     * Envoyer une notification
     */
    public function send(User $user, string $type, string $title, string $content, array $data = [])
    {
        // Stocker en base
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'data' => $data,
            'sent_via' => [],
        ]);
        
        $preferences = $user->notification_preferences ?? [];
        
        // Email
        if (($preferences['email_' . $type] ?? true) && $user->email_verified_at) {
            $this->sendEmail($user, $title, $content, $data);
            $notification->sent_via[] = 'email';
        }
        
        // SMS
        if (($preferences['sms_' . $type] ?? false) && $user->phone_verified_at) {
            $this->smsService->send($user->phone, $content);
            $notification->sent_via[] = 'sms';
        }
        
        $notification->save();
        
        return $notification;
    }
    
    /**
     * Envoyer un email
     */
    protected function sendEmail(User $user, string $title, string $content, array $data)
    {
        Mail::send('emails.notification', [
            'user' => $user,
            'title' => $title,
            'content' => $content,
            'data' => $data
        ], function ($message) use ($user, $title) {
            $message->to($user->email)
                    ->subject($title);
        });
    }
    
    /**
     * Nouveau message
     */
    public function newMessage(User $receiver, User $sender, $message)
    {
        return $this->send(
            $receiver,
            'message',
            'Nouveau message de ' . $sender->full_name,
            $message->content,
            ['sender_id' => $sender->id, 'message_id' => $message->id]
        );
    }
    
    /**
     * Nouveau match
     */
    public function newMatch(User $user, User $matchedUser, float $score)
    {
        return $this->send(
            $user,
            'match',
            'Nouveau match trouvé !',
            'Vous avez un nouveau match avec ' . $matchedUser->full_name . ' (Score: ' . $score . '%)',
            ['matched_user_id' => $matchedUser->id, 'compatibility_score' => $score]
        );
    }
    
    /**
     * Nouvelle annonce correspondante
     */
    public function newMatchingListing(User $user, $listing)
    {
        return $this->send(
            $user,
            'listing_match',
            'Nouvelle annonce correspondante',
            'Une nouvelle annonce correspond à vos critères : ' . $listing->title,
            ['listing_id' => $listing->id]
        );
    }
    
    /**
     * Rappel expiration abonnement
     */
    public function subscriptionExpiring(User $user, int $daysLeft)
    {
        return $this->send(
            $user,
            'subscription_expiring',
            'Votre abonnement expire bientôt',
            "Votre abonnement expirera dans {$daysLeft} jours. Renouvelez pour continuer à profiter des avantages premium.",
            ['days_left' => $daysLeft]
        );
    }
    
    /**
     * Profil incomplet
     */
    public function profileIncomplete(User $user, int $completionScore)
    {
        return $this->send(
            $user,
            'profile_reminder',
            'Complétez votre profil',
            "Votre profil n'est qu'à {$completionScore}% de complétion. Complétez-le pour augmenter vos chances de trouver un colocataire !",
            ['completion_score' => $completionScore]
        );
    }
}