<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'reviewer_id',
        'reviewed_id',
        'listing_id',
        'rating',
        'comment',
        'is_visible',
        'mutual_agreement_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_visible' => 'boolean',
        'mutual_agreement_at' => 'datetime',
    ];

    // ========== RELATIONS ==========
    
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewed()
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    // ========== MÉTHODES ==========
    
    public function publish()
    {
        $this->update([
            'is_visible' => true,
            'mutual_agreement_at' => now()
        ]);
    }

    public function canBeEdited()
    {
        return $this->created_at->diffInHours(now()) < 48;
    }

    // ========== SCOPES ==========
    
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('reviewed_id', $userId);
    }

    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }
}