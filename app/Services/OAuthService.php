<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OAuthService
{
    /**
     * Rediriger vers Google OAuth
     */
    public function getGoogleAuthUrl()
    {
        $params = [
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'email profile',
            'access_type' => 'offline',
        ];
        
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }
    
    /**
     * Obtenir les informations utilisateur depuis Google
     */
    public function getGoogleUser($code)
    {
        // Échanger le code contre un token
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
        ]);
        
        if (!$tokenResponse->successful()) {
            throw new \Exception('Failed to get access token');
        }
        
        $tokens = $tokenResponse->json();
        
        // Obtenir les infos utilisateur
        $userResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $tokens['access_token'],
        ])->get('https://www.googleapis.com/oauth2/v2/userinfo');
        
        if (!$userResponse->successful()) {
            throw new \Exception('Failed to get user info');
        }
        
        $userData = $userResponse->json();
        
        return [
            'id' => $userData['id'],
            'email' => $userData['email'],
            'name' => $userData['name'],
            'avatar' => $userData['picture'] ?? null,
            'token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'] ?? null,
        ];
    }
    
    /**
     * Rediriger vers Facebook OAuth
     */
    public function getFacebookAuthUrl()
    {
        $params = [
            'client_id' => config('services.facebook.client_id'),
            'redirect_uri' => config('services.facebook.redirect'),
            'response_type' => 'code',
            'scope' => 'email,public_profile',
        ];
        
        return 'https://www.facebook.com/v12.0/dialog/oauth?' . http_build_query($params);
    }
    
    /**
     * Obtenir les informations utilisateur depuis Facebook
     */
    public function getFacebookUser($code)
    {
        // Échanger le code contre un token
        $tokenResponse = Http::get('https://graph.facebook.com/v12.0/oauth/access_token', [
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'redirect_uri' => config('services.facebook.redirect'),
            'code' => $code,
        ]);
        
        if (!$tokenResponse->successful()) {
            throw new \Exception('Failed to get access token');
        }
        
        $tokens = $tokenResponse->json();
        
        // Obtenir les infos utilisateur
        $userResponse = Http::get('https://graph.facebook.com/v12.0/me', [
            'fields' => 'id,name,email,picture',
            'access_token' => $tokens['access_token'],
        ]);
        
        if (!$userResponse->successful()) {
            throw new \Exception('Failed to get user info');
        }
        
        $userData = $userResponse->json();
        
        return [
            'id' => $userData['id'],
            'email' => $userData['email'] ?? null,
            'name' => $userData['name'],
            'avatar' => $userData['picture']['data']['url'] ?? null,
            'token' => $tokens['access_token'],
        ];
    }
}