<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;


class AdminSliderController extends Controller
{
    public function index() // Pour l'admin - récupère TOUS les sliders
    {
        $sliders = Slider::ordered()->get();
        return response()->json(['success' => true, 'data' => $sliders]);
    }
    
    // admin
    public function store(Request $request)
    {


        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Upload de l'image avec un nom unique
        $file = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $imagePath = $file->storeAs('sliders', $filename, 'public');

        // Vérifier que l'image a bien été sauvegardée
        if (!Storage::disk('public')->exists($imagePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de l\'image'
            ], 500);
        }

        $slider = Slider::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'image_path' => $imagePath,
            'button_text' => $request->button_text ?? 'Découvrir',
            'button_link' => $request->button_link ?? '/listings',
            'order' => $request->order ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slider créé avec succès',
            'data' => [
                'id' => $slider->id,
                'image_url' => Storage::url($imagePath), // URL complète
                'image_path' => $imagePath
            ]
        ], 201);
    }


    // Admin: Mettre à jour un slider
    public function update(Request $request, $id)
    {
        $slider = Slider::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Si nouvelle image, supprimer l'ancienne
        if ($request->hasFile('image')) {
            if ($slider->image_path) {
                Storage::disk('public')->delete($slider->image_path);
            }
            $slider->image_path = $request->file('image')->store('sliders', 'public');
        }

        $slider->update($request->only([
            'title',
            'subtitle',
            'button_text',
            'button_link',
            'order',
            'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Slider mis à jour',
            'data' => $slider
        ]);
    }

    // Admin: Supprimer un slider
    public function destroy($id)
    {
        $slider = Slider::findOrFail($id);

        // Supprimer l'image
        if ($slider->image_path) {
            Storage::disk('public')->delete($slider->image_path);
        }

        $slider->delete();

        return response()->json([
            'success' => true,
            'message' => 'Slider supprimé'
        ]);
    }
}