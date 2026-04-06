<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomeVerification extends Model
{
    use HasFactory;

    protected $table = 'income_verifications';

    protected $fillable = [
        'user_id',
        'status',
        'declared_income',
        'document_path',
        'document_type',
        'employer_name',
        'job_title',
        'employment_duration_months',
        'verified_at',
        'verified_by',
        'rejection_reason',
        'expires_at',
    ];

    protected $casts = [
        'declared_income' => 'decimal:2',
        'employment_duration_months' => 'integer',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ========== ACCESSORS ==========
    
    public function getIsValidAttribute()
    {
        return $this->status === 'verified' && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function getIncomeLevelAttribute()
    {
        if (!$this->declared_income) return 'unknown';
        
        if ($this->declared_income < 3000) return 'low';
        if ($this->declared_income < 8000) return 'medium';
        if ($this->declared_income < 15000) return 'good';
        return 'high';
    }

    // ========== MÉTHODES ==========
    
    public function approve($adminId)
    {
        $this->update([
            'status' => 'verified',
            'verified_by' => $adminId,
            'verified_at' => now(),
            'expires_at' => now()->addYear(),
            'rejection_reason' => null,
        ]);
        
        // Ajouter le badge au profil
        if ($this->user->profile) {
            $this->user->profile->addBadge('income_verified');
        }
    }

    public function reject($adminId, $reason)
    {
        $this->update([
            'status' => 'rejected',
            'verified_by' => $adminId,
            'rejection_reason' => $reason,
        ]);
    }

    public function expire()
    {
        $this->update(['status' => 'expired']);
        
        if ($this->user->profile) {
            $this->user->profile->removeBadge('income_verified');
        }
    }

    // ========== SCOPES ==========
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified')
                     ->where(function($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }
}