<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    protected $oauthService;

    public function __construct(OAuthService $oauthService)
    {
        $this->oauthService = $oauthService;
    }

    /**
     * Redirection vers Google
     */
    public function redirectToGoogle()
    {
        $url = $this->oauthService->getGoogleAuthUrl();
    // react redirect($url);
    return response()->json(['url' => $url]);
    }

    /**
     * Callback Google
     */
    public function handleGoogleCallback(Request $request)
    {
        $code = $request->get('code');
        
        try {
            $userData = $this->oauthService->getGoogleUser($code);
            
            return $this->handleSocialLogin($userData, 'google');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentification Google échouée: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Redirection vers Facebook
     */
    public function redirectToFacebook()
    {
        $url = $this->oauthService->getFacebookAuthUrl();
        return redirect($url);
    }

    /**
     * Callback Facebook
     */
    public function handleFacebookCallback(Request $request)
    {
        // react will send code in request
        $code = $request->get('code');
        
        try {
            $userData = $this->oauthService->getFacebookUser($code);
            
            return $this->handleSocialLogin($userData, 'facebook');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentification Facebook échouée: ' . $e->getMessage()
            ], 400);
        }
    }

    private function handleSocialLogin($userData, $provider)
    {
        // Chercher un compte social existant
        $socialAccount = User::where('provider', $provider)
            ->where('provider_id', $userData['id'])
            ->first();
            
        if ($socialAccount) {
            $user = $socialAccount->user;
        } else {
            // Chercher un utilisateur avec le même email
            $user = User::where('email', $userData['email'])->first();
            
            if (!$user) {
                // Créer un nouvel utilisateur
                $user = User::create([
                    'full_name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'avatar' => $userData['avatar'],
                    'subscription_plan' => 'free',
                    'remaining_ads' => 2,
                ]);
                
                $user->profile()->create();
            }
            
            // Créer le compte social
            User::create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_id' => $userData['id'],
                'provider_token' => $userData['token'],
                'provider_refresh_token' => $userData['refresh_token'] ?? null,
            ]);
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'user' => $user->only(['id', 'full_name', 'email']),
            'token' => $token
        ]);
    }
}