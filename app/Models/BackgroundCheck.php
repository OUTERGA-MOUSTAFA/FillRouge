<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BackgroundCheck extends Model
{
    use HasFactory;

    protected $table = 'background_checks';

    protected $fillable = [
        'user_id',
        'status',
        'provider',
        'provider_check_id',
        'result',
        'report_data',
        'checks_performed',
        'started_at',
        'completed_at',
        'expires_at',
        'amount_paid',
    ];

    protected $casts = [
        'report_data' => 'array',
        'checks_performed' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'expires_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ========== ACCESSORS ==========
    
    public function getIsClearAttribute()
    {
        return $this->status === 'completed' && $this->result === 'clear';
    }

    public function getIsValidAttribute()
    {
        return $this->status === 'completed' && 
               $this->result === 'clear' &&
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    // ========== MÉTHODES ==========
    
    public function markAsProcessing()
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }
    
    public function complete($result, $reportData)
    {
        $this->update([
            'status' => 'completed',
            'result' => $result,
            'report_data' => $reportData,
            'completed_at' => now(),
            'expires_at' => now()->addYear(),
        ]);
        
        if ($result === 'clear' && $this->user->profile) {
            $this->user->profile->addBadge('background_checked');
        }
    }
    
    public function fail($errorMessage)
    {
        $this->update([
            'status' => 'failed',
            'report_data' => ['error' => $errorMessage],
        ]);
    }
    
    // ========== SCOPES ==========
    
    public function scopeClear($query)
    {
        return $query->where('status', 'completed')->where('result', 'clear');
    }
    
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }
}