<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMessages
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
      public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user->canSendMessage()) {
            $remaining = $user->getRemainingMessagesToday();
            
            return response()->json([
                'success' => false,
                'message' => 'Vous avez atteint votre limite de messages pour aujourd\'hui.',
                'limit_reached' => true,
                'remaining_messages' => $remaining,
                'upgrade_needed' => $user->subscription_plan === 'free'
            ], 429);
        }

        return $next($request);
    }
}
