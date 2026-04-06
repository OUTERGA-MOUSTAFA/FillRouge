<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{
    use HasFactory;

    protected $table = 'verification_codes';

    protected $fillable = [
        'user_id',
        'type',
        'code',
        'destination',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ========== MÉTHODES ==========
    
    public function isValid()
    {
        return !$this->is_used && $this->expires_at->isFuture();
    }

    public function markAsUsed()
    {
        $this->update(['is_used' => true]);
    }

    // ========== SCOPES ==========
    
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
                     ->where('expires_at', '>', now());
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}