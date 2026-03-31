<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'listings';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'price',
        'price_is_negotiable',
        'available_from',
        'available_until',
        'city',
        'neighborhood',
        'address',
        'latitude',
        'longitude',
        'bedrooms',
        'bathrooms',
        'furnished',
        'amenities',
        'house_rules',
        'photos',
        'main_photo',
        'status',
        'views_count',
        'contacts_count',
        'is_featured',
        'featured_until',
        'is_urgent',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_is_negotiable' => 'boolean',
        'available_from' => 'date',
        'available_until' => 'date',
        'furnished' => 'boolean',
        'amenities' => 'array',
        'house_rules' => 'array',
        'photos' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'views_count' => 'integer',
        'contacts_count' => 'integer',
        'is_featured' => 'boolean',
        'featured_until' => 'datetime',
        'is_urgent' => 'boolean',
    ];

    // ========== RELATIONS ==========
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // ========== ACCESSORS ==========
    
    public function getFirstPhotoAttribute()
    {
        if ($this->main_photo) {
            return $this->main_photo;
        }
        
        return $this->photos[0] ?? null;
    }

    public function getGalleryAttribute()
    {
        return $this->photos ?? [];
    }

    public function getIsActiveAttribute()
    {
        return $this->status === 'active';
    }

    public function getIsExpiredAttribute()
    {
        return $this->available_until && $this->available_until->isPast();
    }

    // ========== MÉTHODES ==========
    
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function incrementContacts()
    {
        $this->increment('contacts_count');
    }

    public function activate()
    {
        $this->update(['status' => 'active']);
    }

    public function deactivate()
    {
        $this->update(['status' => 'inactive']);
    }

    public function markAsRented()
    {
        $this->update(['status' => 'rented']);
    }

    public function makeFeatured($days = 7)
    {
        $this->update([
            'is_featured' => true,
            'featured_until' => now()->addDays($days)
        ]);
    }

    public function removeFeatured()
    {
        $this->update([
            'is_featured' => false,
            'featured_until' => null
        ]);
    }

    // ========== SCOPES ==========
    
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)
                     ->where(function($q) {
                         $q->whereNull('featured_until')
                           ->orWhere('featured_until', '>', now());
                     });
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', 'LIKE', "%{$city}%");
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByAmenities($query, array $amenities)
    {
        foreach ($amenities as $amenity) {
            $query->whereJsonContains('amenities', $amenity);
        }
        
        return $query;
    }
}