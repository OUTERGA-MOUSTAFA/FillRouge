<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'bio',
        'description',
        'interests',
        'smoking',
        'pets',
        'sleep_schedule',
        'cleanliness',
        'social_level',
        'occupation',
        'preferred_gender',
        'preferred_min_age',
        'preferred_max_age',
        'accepts_pets',
        'accepts_smokers',
        'is_phone_verified',
        'is_email_verified',
        'is_identity_verified',
        'id_document_path',
        'id_document_type',
        'identity_verified_at',
        'is_background_checked',
        'background_checked_at',
        'badges',
        'compatibility_score',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'interests' => 'array',
        'badges' => 'array',
        'is_phone_verified' => 'boolean',
        'is_email_verified' => 'boolean',
        'is_identity_verified' => 'boolean',
        'is_background_checked' => 'boolean',
        'accepts_pets' => 'boolean',
        'accepts_smokers' => 'boolean',
        'identity_verified_at' => 'datetime',
        'background_checked_at' => 'datetime',
        'compatibility_score' => 'float',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'preferred_min_age' => 'integer',
        'preferred_max_age' => 'integer',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ========== ACCESSORS ==========
    
    public function getInterestsListAttribute()
    {
        if (!$this->interests) {
            return [];
        }
        
        return $this->interests;
    }

    public function getHasCompleteProfileAttribute()
    {
        $required = [
            $this->bio,
            $this->occupation,
            $this->interests,
            $this->smoking,
            $this->pets,
            $this->sleep_schedule,
            $this->cleanliness,
            $this->social_level,
        ];
        
        return collect($required)->filter()->count() >= 5;
    }

    // ========== MÉTHODES ==========
    
    /**
     * Ajouter un badge à l'utilisateur
     */
    public function addBadge($badge)
    {
        $badges = $this->badges ?? [];
        
        if (!in_array($badge, $badges)) {
            $badges[] = $badge;
            $this->update(['badges' => $badges]);
        }
        
        return $this;
    }

    /**
     * Retirer un badge
     */
    public function removeBadge($badge)
    {
        $badges = $this->badges ?? [];
        
        if (($key = array_search($badge, $badges)) !== false) {
            unset($badges[$key]);
            $this->update(['badges' => array_values($badges)]);
        }
        
        return $this;
    }

    /**
     * Vérifier si l'utilisateur a un badge
     */
    public function hasBadge($badge)
    {
        $badges = $this->badges ?? [];
        
        return in_array($badge, $badges);
    }

    /**
     * Vérifier l'identité
     */
    public function verifyIdentity($documentPath, $documentType)
    {
        $this->update([
            'id_document_path' => $documentPath,
            'id_document_type' => $documentType,
            'is_identity_verified' => true,
            'identity_verified_at' => now(),
        ]);
        
        $this->addBadge('identity_verified');
        
        return $this;
    }

    /**
     * Vérification background
     */
    public function verifyBackground()
    {
        $this->update([
            'is_background_checked' => true,
            'background_checked_at' => now(),
        ]);
        
        $this->addBadge('background_checked');
        
        return $this;
    }

    /**
     * Calculer le score de complétion du profil
     */
    public function getCompletionScore()
    {
        $fields = [
            'bio' => 15,
            'description' => 10,
            'interests' => 15,
            'occupation' => 10,
            'smoking' => 5,
            'pets' => 5,
            'sleep_schedule' => 5,
            'cleanliness' => 5,
            'social_level' => 5,
            'preferred_gender' => 5,
            'preferred_min_age' => 5,
            'preferred_max_age' => 5,
            'city' => 10,
        ];
        
        $score = 0;
        
        foreach ($fields as $field => $points) {
            if ($field === 'interests' && !empty($this->interests)) {
                $score += $points;
            } elseif ($this->$field) {
                $score += $points;
            }
        }
        
        return min(100, $score);
    }

    // ========== SCOPES ==========
    
    public function scopeVerified($query)
    {
        return $query->where('is_identity_verified', true);
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', 'LIKE', "%{$city}%");
    }

    public function scopeByInterests($query, array $interests)
    {
        return $query->whereJsonContains('interests', $interests);
    }
}