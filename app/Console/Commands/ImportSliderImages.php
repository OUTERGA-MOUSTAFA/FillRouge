<?php

namespace App\Console\Commands;

use App\Models\Slider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ImportSliderImages extends Command
{
    protected $signature = 'sliders:import-images';
    protected $description = 'Import real images for sliders';

    public function handle()
    {
        $sliders = Slider::all();
        
        foreach ($sliders as $slider) {
            // Télécharger une vraie image depuis Unsplash ou Picsum
            $imageUrl = 'https://picsum.photos/id/' . (100 + $slider->id) . '/1920/600';
            $imageContent = file_get_contents($imageUrl);
            
            // Générer un nom unique
            $filename = 'sliders/slider-' . $slider->id . '.jpg';
            
            // Sauvegarder dans storage/app/public/sliders
            Storage::disk('public')->put($filename, $imageContent);
            
            // Mettre à jour le slider
            $slider->image_path = $filename;
            $slider->save();
            
            $this->info('Image importée pour slider ID: ' . $slider->id);
        }
        
        $this->info('Toutes les images ont été importées avec succès!');
    }
}