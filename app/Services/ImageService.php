<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    protected $manager;
    protected $disk;
    protected $quality;
    protected $maxWidth;
    protected $maxHeight;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
        $this->disk = config('filesystems.default', 'public');
        $this->quality = 85;
        $this->maxWidth = 1200;
        $this->maxHeight = 1200;
    }

    /**
     * Uploader une image (méthode principale)
     */
    public function upload(UploadedFile $file, $folder = 'uploads', $resize = true)
    {
        try {
            // Générer un nom unique
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;

            // Lire l'image
            $image = $this->manager->read($file->getPathname());

            // Redimensionner si nécessaire
            if ($resize && ($image->width() > $this->maxWidth || $image->height() > $this->maxHeight)) {
                $image->scale(width: $this->maxWidth, height: $this->maxHeight);
            }

            // Encoder et sauvegarder
            $encoded = $image->toJpg(quality: $this->quality);
            Storage::disk($this->disk)->put($path, (string) $encoded);

            return Storage::disk($this->disk)->url($path);
            
        } catch (\Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to upload image: ' . $e->getMessage());
        }
    }

    /**
     * Uploader plusieurs images
     */
    public function uploadMultiple(array $files, $folder = 'uploads', $resize = true)
    {
        $uploaded = [];
        
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploaded[] = $this->upload($file, $folder, $resize);
            }
        }
        
        return $uploaded;
    }

    /**
     * Uploader un avatar (carré)
     */
    public function uploadAvatar(UploadedFile $file, $folder = 'avatars')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;
            
            $image = $this->manager->read($file->getPathname());
            
            // Redimensionner en carré (400x400)
            $size = min($image->width(), $image->height(), 400);
            $image->cover(width: $size, height: $size);
            
            $encoded = $image->toJpg(quality: 90);
            Storage::disk($this->disk)->put($path, (string) $encoded);
            
            return Storage::disk($this->disk)->url($path);
            
        } catch (\Exception $e) {
            \Log::error('Avatar upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to upload avatar: ' . $e->getMessage());
        }
    }

    /**
     * Uploader une image de couverture (bannière)
     */
    public function uploadCover(UploadedFile $file, $folder = 'covers')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;
            
            $image = $this->manager->read($file->getPathname());
            
            // Redimensionner pour bannière (1200x400)
            $image->scale(width: 1200, height: 400);
            
            // Rogner si nécessaire
            if ($image->height() > 400) {
                $image->crop(width: 1200, height: 400);
            }
            
            $encoded = $image->toJpg(quality: 85);
            Storage::disk($this->disk)->put($path, (string) $encoded);
            
            return Storage::disk($this->disk)->url($path);
            
        } catch (\Exception $e) {
            \Log::error('Cover upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to upload cover: ' . $e->getMessage());
        }
    }

    /**
     * Uploader une photo de listing (annonce)
     */
    public function uploadListingPhoto(UploadedFile $file, $folder = 'listings')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;
            
            $image = $this->manager->read($file->getPathname());
            
            // Redimensionner pour listing (800x600)
            $image->scale(width: 800, height: 600);
            
            $encoded = $image->toJpg(quality: 80);
            Storage::disk($this->disk)->put($path, (string) $encoded);
            
            // Créer une miniature
            $thumbnailPath = $this->createThumbnail($file, $folder, $filename);
            
            return [
                'original' => Storage::disk($this->disk)->url($path),
                'thumbnail' => Storage::disk($this->disk)->url($thumbnailPath),
            ];
            
        } catch (\Exception $e) {
            \Log::error('Listing photo upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to upload listing photo: ' . $e->getMessage());
        }
    }

    /**
     * Créer une miniature
     */
    protected function createThumbnail(UploadedFile $file, $folder, $filename)
    {
        try {
            $thumbPath = $folder . '/thumb_' . $filename;
            
            // Lire l'image originale
            $image = $this->manager->read($file->getPathname());
            
            // Redimensionner pour thumbnail
            $image->scale(width: 300, height: 200);
            
            $encoded = $image->toJpg(quality: 70);
            Storage::disk($this->disk)->put($thumbPath, (string) $encoded);
            
            return $thumbPath;
            
        } catch (\Exception $e) {
            \Log::error('Thumbnail creation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Uploader un document (CIN, Passport, etc.)
     */
    public function uploadDocument(UploadedFile $file, $folder = 'documents')
    {
        try {
            $extension = strtolower($file->getClientOriginalExtension());
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;
            
            // Pour les PDF, garder le fichier original
            if ($extension === 'pdf') {
                Storage::disk($this->disk)->putFileAs($folder, $file, $filename);
                return Storage::disk($this->disk)->url($path);
            }
            
            // Pour les images, utiliser la méthode upload
            if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                return $this->upload($file, $folder, false);
            }
            
            throw new \Exception('Unsupported file type: ' . $extension);
            
        } catch (\Exception $e) {
            \Log::error('Document upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to upload document: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer une image
     */
    public function delete($path)
    {
        if (empty($path)) {
            return false;
        }
        
        try {
            $relativePath = str_replace(Storage::disk($this->disk)->url(''), '', $path);
            
            if (Storage::disk($this->disk)->exists($relativePath)) {
                Storage::disk($this->disk)->delete($relativePath);
                
                // Supprimer la miniature si elle existe
                $pathInfo = pathinfo($relativePath);
                $thumbPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
                
                if (Storage::disk($this->disk)->exists($thumbPath)) {
                    Storage::disk($this->disk)->delete($thumbPath);
                }
                
                return true;
            }
            
            return false;
            
        } catch (\Exception $e) {
            \Log::error('Image deletion failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Supprimer plusieurs images
     */
    public function deleteMultiple(array $paths)
    {
        $deleted = [];
        
        foreach ($paths as $path) {
            if ($this->delete($path)) {
                $deleted[] = $path;
            }
        }
        
        return $deleted;
    }

    /**
     * Optimiser une image existante
     */
    public function optimize($path, $quality = 80)
    {
        try {
            $relativePath = str_replace(Storage::disk($this->disk)->url(''), '', $path);

            if (!Storage::disk($this->disk)->exists($relativePath)) {
                return false;
            }

            $imageContent = Storage::disk($this->disk)->get($relativePath);
            $image = $this->manager->read($imageContent);
            
            $extension = pathinfo($relativePath, PATHINFO_EXTENSION);
            
            // Encoder avec la nouvelle qualité
            $encoded = $image->encodeByExtension($extension, $quality);
            Storage::disk($this->disk)->put($relativePath, (string) $encoded);
            
            return true;
            
        } catch (\Exception $e) {
            \Log::error('Image optimization failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtenir les informations d'une image
     */
    public function getInfo($path)
    {
        try {
            $relativePath = str_replace(Storage::disk($this->disk)->url(''), '', $path);
            
            if (!Storage::disk($this->disk)->exists($relativePath)) {
                return null;
            }
            
            $imageContent = Storage::disk($this->disk)->get($relativePath);
            $image = $this->manager->read($imageContent);
            
            return [
                'width' => $image->width(),
                'height' => $image->height(),
                'mime' => $image->mimetype(),
                'size' => Storage::disk($this->disk)->size($relativePath),
                'extension' => pathinfo($relativePath, PATHINFO_EXTENSION),
            ];
            
        } catch (\Exception $e) {
            \Log::error('Get image info failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Générer un nom de fichier unique
     */
    protected function generateFileName(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension();
        
        // Si pas d'extension ou extension invalide, utiliser jpg par défaut
        if (empty($extension)) {
            $extension = 'jpg';
        }
        
        return Str::uuid() . '_' . time() . '.' . $extension;
    }

    /**
     * Changer le disque de stockage
     */
    public function setDisk($disk)
    {
        $this->disk = $disk;
        return $this;
    }

    /**
     * Changer la qualité de compression
     */
    public function setQuality($quality)
    {
        $this->quality = $quality;
        return $this;
    }

    /**
     * Changer les dimensions max
     */
    public function setMaxDimensions($width, $height)
    {
        $this->maxWidth = $width;
        $this->maxHeight = $height;
        return $this;
    }
}