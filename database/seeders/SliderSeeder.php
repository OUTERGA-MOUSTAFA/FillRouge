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
        // Vérifier si des sliders existent déjà
        if (Slider::count() > 0) {
            $this->command->info('Les sliders existent déjà. Suppression des anciens...');
            // Supprimer les anciennes images
            $oldSliders = Slider::all();
            foreach ($oldSliders as $slider) {
                if ($slider->image_path && Storage::disk('public')->exists($slider->image_path)) {
                    Storage::disk('public')->delete($slider->image_path);
                }
            }
            Slider::truncate();
        }

        // Chemin vers vos images dans storage/app/public/sliders
        $storagePath = storage_path('app/public/sliders');
        
        // Vérifier si le dossier existe
        if (!File::exists($storagePath)) {
            File::makeDirectory($storagePath, 0755, true);
            $this->command->info('Dossier sliders créé: ' . $storagePath);
        }

        // Liste des images à utiliser (copiez vos images ici ou utilisez des URLs)
        $sliderData = [
            [
                'title' => 'Trouvez votre colocataire idéal',
                'subtitle' => 'Des milliers d\'annonces à Casablanca, Rabat et partout au Maroc',
                'image_url' => 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1920&h=600&fit=crop',
                'button_text' => 'Découvrir',
                'button_link' => '/listings',
                'order' => 1,
            ],
            [
                'title' => 'Colocation sécurisée',
                'subtitle' => 'Annonces vérifiées et profils authentifiés pour votre tranquillité',
                'image_url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=600&fit=crop',
                'button_text' => 'En savoir plus',
                'button_link' => '/about',
                'order' => 2,
            ],
            [
                'title' => 'Rejoignez la communauté Darna',
                'subtitle' => 'Plus de 10 000 membres à la recherche du colocataire parfait',
                'image_url' => 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1920&h=600&fit=crop',
                'button_text' => 'S\'inscrire',
                'button_link' => '/register',
                'order' => 3,
            ],
        ];

        // Pour utiliser vos images locales si elles existent
        $localImages = [
            'slide-1.png',
            'slide-2.png',
            'slide-3.png',
        ];

        foreach ($sliderData as $index => $data) {
            // Vérifier si une image locale existe
            $localImagePath = $storagePath . '/' . $localImages[$index];
            $imagePath = null;
            
            if (File::exists($localImagePath)) {
                // Copier l'image locale vers le storage public
                $newPath = 'sliders/' . uniqid() . '.png';
                Storage::disk('public')->put($newPath, File::get($localImagePath));
                $imagePath = $newPath;
                $this->command->info("Image locale utilisée: {$localImages[$index]}");
            } else {
                // Utiliser une image par défaut (couleur de fond)
                $this->command->warn("Image locale non trouvée: {$localImages[$index]}, utilisation d'une image par défaut");
                // Créer une image par défaut avec une couleur de fond
                $imagePath = $this->createDefaultImage($index + 1);
            }
            
            Slider::create([
                'title' => $data['title'],
                'subtitle' => $data['subtitle'],
                'image_path' => $imagePath,
                'button_text' => $data['button_text'],
                'button_link' => $data['button_link'],
                'order' => $data['order'],
                'is_active' => true,
            ]);
        }

        $this->command->info(count($sliderData) . ' sliders créés avec succès!');
    }

    /**
     * Créer une image par défaut avec une couleur de fond
     */
    private function createDefaultImage($index)
    {
        $colors = ['#16a34a', '#059669', '#10b981'];
        $color = $colors[($index - 1) % count($colors)];
        
        // Créer une image SVG simple
        $svgContent = '<img
            src="data:image/svg+xml;base64,' . base64_encode('<svg width="1920" height="600" xmlns="http://www.w3.org/2000/png">
            <rect width="100%" height="100%" fill="' . $color . '"/>
            <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">
                Darna - Colocation au Maroc
            </text>
        </svg>') . '"
            alt="Slider Image"
            style="width:100%;>';
        
        $filename = 'sliders/default-' . uniqid() . '.png';
        Storage::disk('public')->put($filename, $svgContent);
        
        return $filename;
    }
}