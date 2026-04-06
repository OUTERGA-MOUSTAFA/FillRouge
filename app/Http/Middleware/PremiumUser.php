<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PremiumUser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
   public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user->is_premium) {
            return response()->json([
                'success' => false,
                'message' => 'Cette fonctionnalité est réservée aux utilisateurs premium.',
                'upgrade_required' => true
            ], 403);
        }

        return $next($request);
    }
}
