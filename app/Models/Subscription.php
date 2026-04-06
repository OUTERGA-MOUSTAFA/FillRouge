<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $table = 'subscriptions';

    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'payment_method',
        'payment_id',
        'starts_at',
        'ends_at',
        'is_active',
        'auto_renew',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ========== ACCESSORS ==========
    
    public function getIsExpiredAttribute()
    {
        return $this->ends_at && $this->ends_at->isPast();
    }

    public function getDaysRemainingAttribute()
    {
        if (!$this->ends_at || $this->is_expired) {
            return 0;
        }
        
        return now()->diffInDays($this->ends_at);
    }

    // ========== MÉTHODES ==========
    
    public function activate()
    {
        $this->update(['is_active' => true]);
        
        // Mettre à jour l'utilisateur
        $this->user->update([
            'subscription_plan' => $this->plan,
            'subscription_ends_at' => $this->ends_at,
        ]);
    }

    public function cancel()
    {
        $this->update(['auto_renew' => false]);
    }

    public function expire()
    {
        $this->update(['is_active' => false]);
        
        // Rétrograder l'utilisateur
        $this->user->update([
            'subscription_plan' => 'free',
            'subscription_ends_at' => null,
        ]);
    }

    // ========== SCOPES ==========
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where('ends_at', '>', now());
    }

    public function scopeExpiringSoon($query, $days = 7)
    {
        return $query->where('is_active', true)
                     ->where('ends_at', '<=', now()->addDays($days))
                     ->where('ends_at', '>', now());
    }
}