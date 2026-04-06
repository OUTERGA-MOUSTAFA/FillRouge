<?php

namespace App\Http\Controllers\Auth;

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
     * Inscription
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
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'subscription_plan' => 'free',
            'remaining_ads' => 2,
        ]);

        // Créer le profil
        $user->profile()->create();

        // Envoyer codes de vérification
        $this->sendEmailVerification($user);
        $this->sendPhoneVerification($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie. Veuillez vérifier votre email et téléphone.',
            'user' => $user->only(['id', 'full_name', 'email', 'phone']),
            'token' => $token
        ], 201);
    }

    /**
     * Connexion
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
            'user' => $user->only(['id', 'full_name', 'email', 'phone', 'subscription_plan']),
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
            'user' => $user->only(['id', 'full_name', 'email', 'phone']),
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
     * Envoyer vérification email
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

        Mail::send('emails.verification', ['code' => $code], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Vérification email - Darna');
        });
    }

    /**
     * Envoyer vérification SMS
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

        $this->smsService->send($user->phone, "Votre code Darna: {$code}");
    }

    /**
     * ***********la vérification de l'email***********************
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
/************************************************************ */
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
        
        // Envoyer email de réinitialisation
        Mail::send('emails.password-reset', ['token' => $token, 'user' => $user], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Réinitialisation mot de passe - Darna');
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
     * Renvoyer vérification
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
}