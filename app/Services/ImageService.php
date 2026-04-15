<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;

class ImageService
{
    protected $disk;
    protected $quality;
    protected $maxWidth;
    protected $maxHeight;

    public function __construct()
    {
        $this->disk = config('filesystems.default', 'public');
        $this->quality = 85;
        $this->maxWidth = 1200;
        $this->maxHeight = 1200;
    }

    /**
     * Upload image (MAIN)
     */
    public function upload(UploadedFile $file, $folder = 'uploads', $resize = true)
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;

            $image = Image::make($file->getPathname());

            if ($resize && ($image->width() > $this->maxWidth || $image->height() > $this->maxHeight)) {
                $image->resize($this->maxWidth, $this->maxHeight, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            $image->encode('jpg', $this->quality);

            Storage::disk($this->disk)->put($path, (string) $image);

            return Storage::disk($this->disk)->url($path);

        } catch (\Exception $e) {
            throw new \Exception('Upload failed: ' . $e->getMessage());
        }
    }

    public function uploadMultiple(array $files, $folder = 'uploads', $resize = true)
    {
        return collect($files)
            ->filter(fn($file) => $file instanceof UploadedFile)
            ->map(fn($file) => $this->upload($file, $folder, $resize))
            ->toArray();
    }

    public function uploadAvatar(UploadedFile $file, $folder = 'avatars')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;

            $image = Image::make($file->getPathname());

            // square crop (400x400)
            $image->fit(400, 400);

            $image->encode('jpg', 90);

            Storage::disk($this->disk)->put($path, (string) $image);

            return Storage::disk($this->disk)->url($path);

        } catch (\Exception $e) {
            throw new \Exception('Avatar upload failed: ' . $e->getMessage());
        }
    }

    public function uploadCover(UploadedFile $file, $folder = 'covers')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;

            $image = Image::make($file->getPathname());

            $image->fit(1200, 400);

            $image->encode('jpg', 85);

            Storage::disk($this->disk)->put($path, (string) $image);

            return Storage::disk($this->disk)->url($path);

        } catch (\Exception $e) {
            throw new \Exception('Cover upload failed: ' . $e->getMessage());
        }
    }

    public function uploadListingPhoto(UploadedFile $file, $folder = 'listings')
    {
        try {
            $filename = $this->generateFileName($file);
            $path = $folder . '/' . $filename;

            $image = Image::make($file->getPathname());

            $image->fit(800, 600);

            $image->encode('jpg', 80);

            Storage::disk($this->disk)->put($path, (string) $image);

            $thumbPath = $this->createThumbnail($file, $folder, $filename);

            return [
                'original' => Storage::disk($this->disk)->url($path),
                'thumbnail' => Storage::disk($this->disk)->url($thumbPath),
            ];

        } catch (\Exception $e) {
            throw new \Exception('Listing upload failed: ' . $e->getMessage());
        }
    }

    protected function createThumbnail(UploadedFile $file, $folder, $filename)
    {
        $thumbPath = $folder . '/thumb_' . $filename;

        $image = Image::make($file->getPathname());

        $image->fit(300, 200);

        $image->encode('jpg', 70);

        Storage::disk($this->disk)->put($thumbPath, (string) $image);

        return $thumbPath;
    }

    public function uploadDocument(UploadedFile $file, $folder = 'documents')
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = $this->generateFileName($file);
        $path = $folder . '/' . $filename;

        if ($extension === 'pdf') {
            Storage::disk($this->disk)->putFileAs($folder, $file, $filename);
            return Storage::disk($this->disk)->url($path);
        }

        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            return $this->upload($file, $folder, false);
        }

        throw new \Exception('Unsupported file type');
    }

    protected function generateFileName(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        return Str::uuid() . '_' . time() . '.' . $extension;
    }
}