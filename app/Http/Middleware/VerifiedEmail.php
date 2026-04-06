<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedEmail
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez vérifier votre email pour accéder à cette ressource.',
                'requires_verification' => 'email'
            ], 403);
        }
        
        return $next($request);
    }
}
