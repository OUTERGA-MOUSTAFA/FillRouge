<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'listing_id',
        'content',
        'attachments',
        'is_read',
        'read_at',
        'is_reported',
        'report_reason',
        'is_deleted_by_sender',
        'is_deleted_by_receiver',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_read' => 'boolean',
        'is_reported' => 'boolean',
        'is_deleted_by_sender' => 'boolean',
        'is_deleted_by_receiver' => 'boolean',
        'read_at' => 'datetime',
    ];

    // ========== RELATIONS ==========
    
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    // ========== ACCESSORS ==========
    
    public function getIsSentByCurrentUserAttribute()
    {
        return auth()->id() === $this->sender_id;
    }

    // ========== MÉTHODES ==========
    
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }
    }

    public function report($reason)
    {
        $this->update([
            'is_reported' => true,
            'report_reason' => $reason
        ]);
    }

    public function deleteForUser($userId)
    {
        if ($userId == $this->sender_id) {
            $this->update(['is_deleted_by_sender' => true]);
        } elseif ($userId == $this->receiver_id) {
            $this->update(['is_deleted_by_receiver' => true]);
        }
        
        // Si les deux ont supprimé, supprimer définitivement
        if ($this->is_deleted_by_sender && $this->is_deleted_by_receiver) {
            $this->forceDelete();
        }
    }

    // ========== SCOPES ==========
    
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeBetweenUsers($query, $userId1, $userId2)
    {
        return $query->where(function($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId1)->where('receiver_id', $userId2);
        })->orWhere(function($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId2)->where('receiver_id', $userId1);
        });
    }

    public function scopeNotDeletedFor($query, $userId)
    {
        return $query->where(function($q) use ($userId) {
            $q->where('sender_id', '!=', $userId)
              ->orWhere('is_deleted_by_sender', false);
        })->where(function($q) use ($userId) {
            $q->where('receiver_id', '!=', $userId)
              ->orWhere('is_deleted_by_receiver', false);
        });
    }
}