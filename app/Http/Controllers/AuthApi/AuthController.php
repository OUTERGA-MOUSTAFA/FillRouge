<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|unique:users',
            'gender' => 'nullable|in:male,female,other',
            'age_range' => 'nullable|string',
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
            'age_range' => $request->age_range,
        ]);

        // Créer le profil
        $user->profile()->create();

        // Générer token avec Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'full_name', 'email', 'phone']),
            'token' => $token,
            'message' => 'Inscription réussie'
        ], 201);
    }

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
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Vérifier 2FA
        if ($user->two_factor_enabled) {
            // Générer un token temporaire pour 2FA
            $twoFactorToken = hash_hmac('sha256', $user->id . now(), config('app.key'));
            
            // Stocker le token temporaire
            DB::table('two_factor_tokens')->insert([
                'user_id' => $user->id,
                'token' => $twoFactorToken,
                'expires_at' => now()->addMinutes(5),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            return response()->json([
                'requires_2fa' => true,
                'two_factor_token' => $twoFactorToken,
                'message' => 'Code 2FA requis'
            ], 200);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'full_name', 'email', 'phone']),
            'token' => $token,
            'message' => 'Connexion réussie'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('profile');
        
        return response()->json($user);
    }
}