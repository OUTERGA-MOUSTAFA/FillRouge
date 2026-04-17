<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Slider extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'image_path',
        'button_text',
        'button_link',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // Access a l'URL complète de l'image
     public function getImageUrlAttribute()
    {
        if ($this->image_path) {
            // Vérifier si le fichier existe dans le storage
            if (Storage::disk('public')->exists($this->image_path)) {
                return Storage::url($this->image_path);
            }
        }
        
        // Image par défaut si l'image n'existe pas
        return asset('images/default-slider.jpg');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
