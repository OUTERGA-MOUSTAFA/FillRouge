<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;

class SliderController extends Controller
{
    // Récupérer tous les sliders actifs (pour le frontend)
     public function index() // Pour le frontend public
    {
        $sliders = Slider::active()->ordered()->get()->map(...);
        return response()->json(['success' => true, 'data' => $sliders]);
    }
}
