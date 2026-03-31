<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matching extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'user_id',
        'matched_user_id',
        'compatibility_score',
        'common_interests',
        'status',
        'matched_at',
    ];

    protected $casts = [
        'common_interests' => 'array',
        'compatibility_score' => 'float',
        'matched_at' => 'datetime',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function matchedUser()
    {
        return $this->belongsTo(User::class, 'matched_user_id');
    }

    // ========== MÉTHODES ==========
    
    public function accept()
    {
        $this->update([
            'status' => 'accepted',
            'matched_at' => now()
        ]);
        
        return $this;
    }

    public function decline()
    {
        $this->update(['status' => 'declined']);
        
        return $this;
    }

    public function block()
    {
        $this->update(['status' => 'blocked']);
        
        return $this;
    }
}