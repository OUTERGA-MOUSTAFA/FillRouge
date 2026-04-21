<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\VerificationCode;
use App\Services\SmsService;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected $smsService;
    protected $twoFactorService;

    public function __construct(SmsService $smsService, TwoFactorService $twoFactorService)
    {
        $this->smsService = $smsService;
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Inscription utilisateur
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|unique:users',
            'gender' => 'nullable|in:male,female,other',
            'birth_date' => 'nullable|date|before:today',
            'role' => 'required|string|in:chercheur,semsar',
            'interests' => 'nullable|array',
            'interests.*' => 'string|in:cooking,fitness,tech,travel,study,remote_work,music,sports,reading,art,gaming,outdoors',
            'bio' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Créer l'utilisateur
        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'subscription_plan' => 'free',
            'remaining_ads' => 2,
            'role' => $request->role,
        ]);

        // Créer le profil utilisateur avec les intérêts et la bio
        $profileData = [
            'user_id' => $user->id,
        ];
        
        if ($request->has('interests')) {
            $profileData['interests'] = $request->interests;
        }
        
        if ($request->has('bio')) {
            $profileData['bio'] = $request->bio;
        }
        
        $user->profile()->create($profileData);

        // Vérification email (auto-vérifié en développement)
        if (app()->environment('local')) {
            $user->update(['email_verified_at' => now()]);
        } else {
            $this->sendEmailVerification($user);
            $this->sendPhoneVerification($user);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Charger le profil
        $user->load('profile');

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie. Veuillez vérifier votre email et téléphone.',
            'user' => $user->only(['id', 'full_name', 'email', 'phone', 'role']),
            'profile' => $user->profile,
            'token' => $token
        ], 201);
    }

    /**
     * Connexion utilisateur
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Vérifier 2FA
        if ($user->two_factor_enabled) {
            $twoFactorToken = Str::random(64);
            cache()->put("2fa:{$twoFactorToken}", $user->id, 300);
            
            return response()->json([
                'success' => true,
                'requires_2fa' => true,
                'two_factor_token' => $twoFactorToken,
                'message' => 'Code 2FA requis'
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'success' => true,
            'user' => $user->only(['id', 'full_name', 'email', 'phone', 'role']),
            'token' => $token
        ]);
    }

    /**
     * Vérifier le code 2FA
     */
    public function verifyTwoFactor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'two_factor_token' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = cache()->get("2fa:{$request->two_factor_token}");
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Session 2FA expirée'
            ], 401);
        }

        $user = User::find($userId);
        
        if (!$this->twoFactorService->verifyCode($user->two_factor_secret, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Code 2FA invalide'
            ], 401);
        }

        cache()->forget("2fa:{$request->two_factor_token}");
        
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'success' => true,
            'user' => $user->only(['id', 'full_name', 'email', 'phone', 'role']),
            'token' => $token
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Déconnecté'
        ]);
    }

    /**
     * Envoyer code de vérification email
     */
    private function sendEmailVerification(User $user)
    {
        $code = $this->smsService->generateOtp();
        
        VerificationCode::create([
            'user_id' => $user->id,
            'type' => 'email',
            'code' => $code,
            'destination' => $user->email,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::send('emails.verification', ['user' => $user, 'code' => $code], function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Vérification email - Semsar');
        });
    }

    /**
     * Envoyer code de vérification SMS
     */
    private function sendPhoneVerification(User $user)
    {
        $code = $this->smsService->generateOtp();
        
        VerificationCode::create([
            'user_id' => $user->id,
            'type' => 'phone',
            'code' => $code,
            'destination' => $user->phone,
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->smsService->send($user->phone, "Votre code Emasar: {$code}");
    }

    /**
     * Vérifier email
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        $verification = VerificationCode::where('user_id', $user->id)
            ->where('type', 'email')
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->where('is_used', false)
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Code invalide ou expiré'
            ], 400);
        }

        $verification->markAsUsed();
        $user->update(['email_verified_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Email vérifié'
        ]);
    }

    /**
     * Vérifier téléphone
     */
    public function verifyPhone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        $verification = VerificationCode::where('user_id', $user->id)
            ->where('type', 'phone')
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->where('is_used', false)
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Code invalide ou expiré'
            ], 400);
        }

        $verification->markAsUsed();
        $user->update(['phone_verified_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Téléphone vérifié'
        ]);
    }

    /**
     * Renvoyer les codes de vérification
     */
    public function resendVerification(Request $request)
    {
        $user = $request->user();
        
        if (!$user->email_verified_at) {
            $this->sendEmailVerification($user);
        }
        
        if (!$user->phone_verified_at) {
            $this->sendPhoneVerification($user);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Codes de vérification renvoyés'
        ]);
    }

    /**
     * Mot de passe oublié
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $token = Str::random(64);
        
        cache()->put("password_reset:{$token}", $user->id, 3600);
        
        Mail::send('emails.password-reset', ['token' => $token, 'user' => $user], function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Réinitialisation mot de passe - Emasar');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Email de réinitialisation envoyé'
        ]);
    }

    /**
     * Réinitialiser mot de passe
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = cache()->get("password_reset:{$request->token}");
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide ou expiré'
            ], 400);
        }

        $user = User::find($userId);
        $user->update(['password' => Hash::make($request->password)]);
        
        cache()->forget("password_reset:{$request->token}");
        
        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé'
        ]);
    }

    /**
     * Activer 2FA
     */
    public function enableTwoFactor(Request $request)
    {
        $user = $request->user();
        
        $secret = $this->twoFactorService->generateSecret();
        $qrCode = $this->twoFactorService->generateQRCode($user->email, $secret);
        
        $user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode($this->twoFactorService->generateRecoveryCodes())
        ]);
        
        return response()->json([
            'success' => true,
            'message' => '2FA activé',
            'data' => [
                'secret' => $secret,
                'qr_code' => $qrCode,
                'recovery_codes' => json_decode($user->two_factor_recovery_codes)
            ]
        ]);
    }

    /**
     * Désactiver 2FA
     */
    public function disableTwoFactor(Request $request)
    {
        $request->user()->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => '2FA désactivé'
        ]);
    }
}