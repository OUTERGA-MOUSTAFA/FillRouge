<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedIdentity
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
         $user = $request->user();
        
        if (!$user->profile || !$user->profile->is_identity_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez vérifier votre identité (CIN/Passport) pour accéder à cette ressource.',
                'requires_verification' => 'identity'
            ], 403);
        }

        return $next($request);
    }
}
