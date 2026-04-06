<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedPhone
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->phone_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez vérifier votre numéro de téléphone pour accéder à cette ressource.',
                'requires_verification' => 'phone'
            ], 403);
        }
        return $next($request);
    }
}
