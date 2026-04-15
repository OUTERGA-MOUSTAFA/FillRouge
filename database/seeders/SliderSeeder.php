<?php

namespace Database\Seeders;

use App\Models\Slider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        // source images (public folder)
        $sourceImages = [
            'avatars/slide-1.png',
            'avatars/slide-2.png',
            'avatars/slide-3.png',
        ];

        $sliders = [];
        $order = 1;

        foreach ($sourceImages as $image) {

            try {
                $sourcePath = public_path('storage/' . $image);

                if (!File::exists($sourcePath)) {
                    $this->command->error("Image not found: $image");
                    continue;
                }

                // read file
                $contents = File::get($sourcePath);

                // new path in storage
                $newPath = 'sliders/' . basename($image);

                Storage::disk('public')->put($newPath, $contents);

                $sliders[] = [
                    'title' => "Slider $order",
                    'subtitle' => "Description du slider $order",
                    'image_path' => $newPath,
                    'button_text' => 'Découvrir',
                    'button_link' => '/listings',
                    'order' => $order,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $order++;

            } catch (\Exception $e) {
                $this->command->error("Erreur: " . $e->getMessage());
            }
        }

        Slider::insert($sliders);

        $this->command->info('Sliders créés avec succès!');
    }
}