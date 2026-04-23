<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Http;

class ImageService
{
    // protected $disk;
    // protected $quality;
    // protected $maxWidth;
    // protected $maxHeight;

    // public function __construct()
    // {
    //     $this->disk = config('filesystems.default', 'public');
    //     $this->quality = 85;
    //     $this->maxWidth = 1200;
    //     $this->maxHeight = 1200;
    // }

    /**
     * Upload image (MAIN)
     */
    // public function upload(UploadedFile $file, $folder = 'uploads', $resize = true)
    // {
    //     try {
    //         $filename = $this->generateFileName($file);
    //         $path = $folder . '/' . $filename;

    //         $image = Image::make($file->getPathname());

    //         if ($resize && ($image->width() > $this->maxWidth || $image->height() > $this->maxHeight)) {
    //             $image->resize($this->maxWidth, $this->maxHeight, function ($constraint) {
    //                 $constraint->aspectRatio();
    //                 $constraint->upsize();
    //             });
    //         }

    //         $image->encode('jpg', $this->quality);

    //         Storage::disk($this->disk)->put($path, (string) $image);

    //         return Storage::disk($this->disk)->url($path);
    //     } catch (\Exception $e) {
    //         throw new \Exception('Upload failed: ' . $e->getMessage());
    //     }
    // }

    // public function uploadMultiple(array $files, $folder = 'uploads', $resize = true)
    // {
    //     return collect($files)
    //         ->filter(fn($file) => $file instanceof UploadedFile)
    //         ->map(fn($file) => $this->upload($file, $folder, $resize))
    //         ->toArray();
    // }

    // public function uploadAvatar(UploadedFile $file, $folder = 'avatars')
    // {
    //     try {
    //         $filename = $this->generateFileName($file);
    //         $path = $folder . '/' . $filename;

    //         $image = Image::make($file->getPathname());

    //         // square crop (400x400)
    //         $image->fit(400, 400);

    //         $image->encode('jpg', 90);

    //         Storage::disk($this->disk)->put($path, (string) $image);

    //         return Storage::disk($this->disk)->url($path);
    //     } catch (\Exception $e) {
    //         throw new \Exception('Avatar upload failed: ' . $e->getMessage());
    //     }
    // }


    // public function upload(UploadedFile $file, $folder = 'uploads', $resize = true)
    // {
    //     try {
    //         // optional:resize before upload
    //         $image = Image::make($file->getPathname());

    //         if ($resize && ($image->width() > $this->maxWidth || $image->height() > $this->maxHeight)) {
    //             $image->resize($this->maxWidth, $this->maxHeight, function ($constraint) {
    //                 $constraint->aspectRatio();
    //                 $constraint->upsize();
    //             });
    //         }

    //         $image->encode('jpg', $this->quality);

    //         // upload to Cloudinary
    //         $response = Http::attach(
    //             'file',
    //             (string) $image,
    //             $file->getClientOriginalName()
    //         )->post('https://api.cloudinary.com/v1_1/' . env('CLOUDINARY_CLOUD_NAME') . '/image/upload', [
    //             'upload_preset' => 'unsigned_upload',
    //             'folder' => $folder
    //         ]);

    //         if (!$response->successful()) {
    //             throw new \Exception('Cloudinary upload failed');
    //         }

    //         return $response['secure_url'];
    //     } catch (\Exception $e) {
    //         throw new \Exception('Upload failed: ' . $e->getMessage());
    //     }
    // }


    // public function uploadCover(UploadedFile $file, $folder = 'covers')
    // {
    //     try {
    //         $filename = $this->generateFileName($file);
    //         $path = $folder . '/' . $filename;

    //         $image = Image::make($file->getPathname());

    //         $image->fit(1200, 400);

    //         $image->encode('jpg', 85);

    //         Storage::disk($this->disk)->put($path, (string) $image);

    //         return Storage::disk($this->disk)->url($path);
    //     } catch (\Exception $e) {
    //         throw new \Exception('Cover upload failed: ' . $e->getMessage());
    //     }
    // }

    // public function uploadListingPhoto(UploadedFile $file, $folder = 'listings')
    // {
    //     try {
    //         $filename = $this->generateFileName($file);
    //         $path = $folder . '/' . $filename;

    //         $image = Image::make($file->getPathname());

    //         $image->fit(800, 600);

    //         $image->encode('jpg', 80);

    //         Storage::disk($this->disk)->put($path, (string) $image);

    //         $thumbPath = $this->createThumbnail($file, $folder, $filename);

    //         return [
    //             'original' => Storage::disk($this->disk)->url($path),
    //             'thumbnail' => Storage::disk($this->disk)->url($thumbPath),
    //         ];
    //     } catch (\Exception $e) {
    //         throw new \Exception('Listing upload failed: ' . $e->getMessage());
    //     }
    // }

    // protected function createThumbnail(UploadedFile $file, $folder, $filename)
    // {
    //     $thumbPath = $folder . '/thumb_' . $filename;

    //     $image = Image::make($file->getPathname());

    //     $image->fit(300, 200);

    //     $image->encode('jpg', 70);

    //     Storage::disk($this->disk)->put($thumbPath, (string) $image);

    //     return $thumbPath;
    // }

    // public function uploadDocument(UploadedFile $file, $folder = 'documents')
    // {
    //     $extension = strtolower($file->getClientOriginalExtension());
    //     $filename = $this->generateFileName($file);
    //     $path = $folder . '/' . $filename;

    //     if ($extension === 'pdf') {
    //         Storage::disk($this->disk)->putFileAs($folder, $file, $filename);
    //         return Storage::disk($this->disk)->url($path);
    //     }

    //     if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
    //         return $this->upload($file, $folder, false);
    //     }

    //     throw new \Exception('Unsupported file type');
    // }

    // protected function generateFileName(UploadedFile $file)
    // {
    //     $extension = $file->getClientOriginalExtension() ?: 'jpg';
    //     return Str::uuid() . '_' . time() . '.' . $extension;
    // }

    // /**
    //  * Delete a single image by its URL or path
    //  */
    // public function delete(string $urlOrPath): bool
    // {
    //     // Convert full URL to storage path if needed
    //     $path = $this->extractPathFromUrl($urlOrPath);

    //     if ($path && Storage::disk($this->disk)->exists($path)) {
    //         return Storage::disk($this->disk)->delete($path);
    //     }

    //     return false;
    // }

    // /**
    //  * Delete multiple images
    //  */
    // public function deleteMultiple(array $urlsOrPaths): void
    // {
    //     foreach ($urlsOrPaths as $urlOrPath) {
    //         $this->delete($urlOrPath);
    //     }
    // }

    // /**
    //  * Delete a listing photo along with its thumbnail
    //  */
    // public function deleteListingPhoto(string $urlOrPath): bool
    // {
    //     $path = $this->extractPathFromUrl($urlOrPath);

    //     if (!$path) return false;

    //     // Delete thumbnail too (thumb_ prefix)
    //     $directory = dirname($path);
    //     $filename  = basename($path);
    //     $thumbPath = $directory . '/thumb_' . $filename;

    //     Storage::disk($this->disk)->delete($thumbPath); // silent fail if missing

    //     return $this->delete($path);
    // }

    // /**
    ///// * Convert a full storage URL back to a relative path
    // / */
    // protected function extractPathFromUrl(string $urlOrPath): ?string
    // {
    //     // Already a relative path
    //     if (!str_starts_with($urlOrPath, 'http')) {
    //         return $urlOrPath;
    //     }

    //     // Strip the storage base URL to get the relative path
    //     $baseUrl = Storage::disk($this->disk)->url('');
    //     if (str_starts_with($urlOrPath, $baseUrl)) {
    //         return ltrim(substr($urlOrPath, strlen($baseUrl)), '/');
    //     }

    //     return null;
    // }


    protected $cloudName;
    protected $uploadPreset;

    public function __construct()
    {
        $this->cloudName = env('CLOUDINARY_CLOUD_NAME');
        $this->uploadPreset = env('CLOUDINARY_UPLOAD_PRESET');
    }

    /**
     * Upload image (main)
     */
    public function upload(UploadedFile $file, $folder = 'uploads', $resize = true)
    {
        try {
            $image = Image::make($file->getPathname());

            if ($resize) {
                $image->resize(1200, 1200, function ($c) {
                    $c->aspectRatio();
                    $c->upsize();
                });
            }

            $image->encode('jpg', 85);

            $publicId = $folder . '/' . Str::uuid();

            $response = Http::attach(
                'file',
                (string) $image,
                'image.jpg'
            )->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload", [
                'upload_preset' => $this->uploadPreset,
                'public_id' => $publicId
            ]);

            if (!$response->successful()) {
                throw new \Exception($response->body());
            }

            return [
                'url' => $response['secure_url'],
                'public_id' => $response['public_id'],
            ];

        } catch (\Exception $e) {
            throw new \Exception('Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Upload with thumbnail
     */
    public function uploadWithThumbnail(UploadedFile $file, $folder = 'uploads')
    {
        $data = $this->upload($file, $folder);

        return [
            'original' => $data['url'],
            'thumbnail' => $this->getThumbnailUrl($data['public_id']),
            'public_id' => $data['public_id']
        ];
    }

    /**
     * Generate thumbnail URL (Cloudinary transformation)
     */
    public function getThumbnailUrl($publicId)
    {
        return "https://res.cloudinary.com/{$this->cloudName}/image/upload/w_300,h_200,c_fill/{$publicId}.jpg";
    }

    /**
     * Delete image
     */
    public function delete($publicId)
    {
        try {
            $timestamp = time();

            $signature = sha1("public_id={$publicId}&timestamp={$timestamp}" . env('CLOUDINARY_API_SECRET'));

            $response = Http::post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/destroy", [
                'public_id' => $publicId,
                'api_key' => env('CLOUDINARY_API_KEY'),
                'timestamp' => $timestamp,
                'signature' => $signature
            ]);

            return $response['result'] === 'ok';

        } catch (\Exception $e) {
            return false;
        }
    }

}
