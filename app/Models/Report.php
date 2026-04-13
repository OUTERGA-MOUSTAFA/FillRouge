<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'reports';

    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'listing_id',
        'message_id',
        'reason',
        'description',
        'status',
        'resolved_by',
        'resolved_at',
        'resolution_note',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    // Relations
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Méthodes
    public function resolve($adminId, $action, $note = null)
    {
        $this->update([
            'status' => 'resolved',
            'resolved_by' => $adminId,
            'resolved_at' => now(),
            'resolution_note' => $note,
        ]);
        
        if ($action === 'suspend_user' && $this->reported_user_id) {
            $this->reportedUser->update(['suspended_until' => now()->addDays(30)]);
        } elseif ($action === 'delete_listing' && $this->listing_id) {
            $this->listing->delete();
        } elseif ($action === 'delete_message' && $this->message_id) {
            $this->message->delete();
        }
    }

    public function reject($adminId, $note = null)
    {
        $this->update([
            'status' => 'rejected',
            'resolved_by' => $adminId,
            'resolved_at' => now(),
            'resolution_note' => $note,
        ]);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}