<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SliderController extends Controller
{
    // Récupérer tous les sliders actifs (pour le frontend)
    public function index()
    {
        $sliders = Slider::active()
            ->ordered()
            ->get()
            ->map(function ($slider) {
                
                $exists = Storage::disk('public')->exists($slider->image_path);
                Log::info('Image check:', [
                    'slider_id' => $slider->id,
                    'image_path' => $slider->image_path,
                    'exists' => $exists,
                    'full_url' => $exists ? Storage::url($slider->image_path) : null
                ]);

                return [
                    'id'          => $slider->id,
                    'title'       => $slider->title,
                    'subtitle'    => $slider->subtitle,
                    'image'       => $slider->image_url,  // URL Cloudinary déjà prête
                    'button_text' => $slider->button_text,
                    'button_link' => $slider->button_link,
                ];
            });
        return response()->json([
            'success' => true,
            'data' => $sliders
        ]);
    }

}
