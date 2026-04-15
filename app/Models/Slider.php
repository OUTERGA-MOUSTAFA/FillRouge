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
        return Storage::disk('public')->url($this->image_path);
    }

    // pour récupérer seulement les sliders actifs
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // trier par ordre
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}