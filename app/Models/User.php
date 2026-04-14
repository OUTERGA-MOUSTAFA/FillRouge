<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password',
        'avatar',
        'gender',
        'birth_date',
        'role',
        'profession',
        'budget_min',
        'budget_max',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'subscription_plan',
        'subscription_ends_at',
        'daily_messages_count',
        'last_message_reset_date',
        'remaining_ads',
        'is_featured',
        'profile_views',
        'last_seen_at',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'email_verified_at',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'provider_token',
        'provider_refresh_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'birth_date' => 'date',
        'two_factor_enabled' => 'boolean',
        'subscription_ends_at' => 'datetime',
        'last_message_reset_date' => 'date',
        'last_seen_at' => 'datetime',
        'is_featured' => 'boolean',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'daily_messages_count' => 'integer',
        'remaining_ads' => 'integer',
        'profile_views' => 'integer',
        'is_admin' => 'boolean',

    ];

    // Accesseur
    public function getIsAdminAttribute()
    {
        return $this->role === 'admin' || $this->email === 'Semsar@darna.com';
    }

    // is admin
    public function isAdmin()
    {
        return $this->is_admin;
    }

    // ========== RELATIONS ==========

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function matches()
    {
        return $this->hasMany(Matching::class, 'user_id');
    }

    public function matchedUsers()
    {
        return $this->belongsToMany(User::class, 'matches', 'user_id', 'matched_user_id')
            ->withPivot('compatibility_score', 'common_interests', 'status', 'matched_at')
            ->withTimestamps();
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->where('is_active', true)->latest();
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function verificationCodes()
    {
        return $this->hasMany(VerificationCode::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    public function sentReports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->notifications()->where('is_read', false);
    }

    // ========== ACCESSORS ==========

    public function getAgeAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }
        return $this->birth_date->age;
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('is_visible', true)->avg('rating') ?? 0;
    }

    public function getIsPremiumAttribute()
    {
        return $this->subscription_plan === 'premium' &&
            ($this->subscription_ends_at === null || $this->subscription_ends_at->isFuture());
    }

    public function getIsStandardAttribute()
    {
        return $this->subscription_plan === 'standard' &&
            ($this->subscription_ends_at === null || $this->subscription_ends_at->isFuture());
    }

    public function getVerificationBadgesAttribute()
    {
        $badges = [];

        if ($this->email_verified_at) {
            $badges[] = 'email_verified';
        }

        if ($this->phone_verified_at) {
            $badges[] = 'phone_verified';
        }

        if ($this->profile && $this->profile->is_identity_verified) {
            $badges[] = 'identity_verified';
        }

        if ($this->profile && $this->profile->is_background_checked) {
            $badges[] = 'background_checked';
        }

        if ($this->is_premium) {
            $badges[] = 'premium';
        }

        return $badges;
    }

    // ========== MÉTHODES UTILITAIRES ==========

    /**
     * Vérifier si l'utilisateur peut envoyer un message
     */
    public function canSendMessage()
    {
        if ($this->is_premium) {
            return true;
        }

        $dailyLimit = $this->subscription_plan === 'standard' ? 50 : 5;

        // Reset le compteur quotidien si nécessaire
        if ($this->last_message_reset_date != now()->toDateString()) {
            $this->update([
                'daily_messages_count' => 0,
                'last_message_reset_date' => now()
            ]);
        }

        return $this->daily_messages_count < $dailyLimit;
    }

    /**
     * Vérifier si l'utilisateur peut créer une annonce
     */
    public function canCreateListing()
    {
        $maxAds = match ($this->subscription_plan) {
            'free' => 2,
            'standard' => 10,
            'premium' => PHP_INT_MAX,
            default => 2,
        };

        $activeAds = $this->listings()->where('status', 'active')->count();

        return $activeAds < $maxAds;
    }

    /**
     * Incrémenter le compteur de messages
     */
    public function incrementMessagesCount()
    {
        $this->increment('daily_messages_count');
    }

    /**
     * Vérifier si l'utilisateur est vérifié
     */
    public function isVerified()
    {
        return $this->email_verified_at && $this->phone_verified_at;
    }

    /**
     * Obtenir le nombre de messages restants aujourd'hui
     */
    public function getRemainingMessagesToday()
    {
        if ($this->is_premium) {
            return PHP_INT_MAX;
        }

        $dailyLimit = $this->subscription_plan === 'standard' ? 50 : 5;
        $used = $this->daily_messages_count;

        return max(0, $dailyLimit - $used);
    }

    /**
     * Obtenir le nombre d'annonces restantes
     */
    public function getRemainingAds()
    {
        $maxAds = match ($this->subscription_plan) {
            'free' => 2,
            'standard' => 10,
            'premium' => PHP_INT_MAX,
            default => 2,
        };

        $activeAds = $this->listings()->where('status', 'active')->count();

        return max(0, $maxAds - $activeAds);
    }

    /**
     * Mettre à jour la dernière activité
     */
    public function updateLastSeen()
    {
        $this->update(['last_seen_at' => now()]);
    }

    /**
     * Incrémenter les vues de profil
     */
    public function incrementProfileViews()
    {
        $this->increment('profile_views');
    }

    /**
     * Vérifier si l'utilisateur a bloqué un autre utilisateur
     */
    public function hasBlocked($userId)
    {
        return Block::where('user_id', $this->id)
            ->where('blocked_user_id', $userId)
            ->exists();
    }

    public function blocks()
    {
        return $this->hasMany(Block::class, 'user_id');
    }
    public function blockedBy()
    {
        return $this->hasMany(Block::class, 'blocked_user_id');
    }

    /**
     * Vérifier si l'utilisateur est en ligne
     */
    public function isOnline()
    {
        return $this->last_seen_at && $this->last_seen_at->diffInMinutes(now()) < 5;
    }

    // ========== SCOPES ==========

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at')
            ->whereNotNull('phone_verified_at');
    }

    public function scopePremium($query)
    {
        return $query->where('subscription_plan', 'premium')
            ->where(function ($q) {
                $q->whereNull('subscription_ends_at')
                    ->orWhere('subscription_ends_at', '>', now());
            });
    }

    public function scopeActive($query)
    {
        return $query->where('deleted_at', null);
    }

    public function scopeByCity($query, $city)
    {
        return $query->whereHas('profile', function ($q) use ($city) {
            $q->where('city', $city);
        });
    }

    public function scopeWithBudget($query, $min, $max)
    {
        return $query->whereBetween('budget_min', [$min, $max])
            ->orWhereBetween('budget_max', [$min, $max]);
    }
}
