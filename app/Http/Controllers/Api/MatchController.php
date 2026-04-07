<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matching;
use App\Models\User;
use App\Services\MatchingService;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    protected $matchingService;

    public function __construct(MatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * Liste des matches
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $matches = Matching::where('user_id', $user->id)
            ->orWhere('matched_user_id', $user->id)
            ->with(['user', 'matchedUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($match) use ($user) {
                $matchedUser = $match->user_id === $user->id 
                    ? $match->matchedUser 
                    : $match->user;
                
                return [
                    'user' => $matchedUser->only(['id', 'full_name', 'avatar', 'age']),
                    'score' => $match->compatibility_score,
                    'status' => $match->status,
                    'matched_at' => $match->matched_at,
                    'common_interests' => $match->common_interests,
                    'can_message' => $match->status === 'accepted'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $matches
        ]);
    }

    /**
     * Accepter un match
     */
    public function accept(User $user)
    {
        $currentUser = auth()->user();
        
        // Chercher le match
        $match = Matching::where(function($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('inged_user_id', $user->id);
        })->orWhere(function($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('inged_user_id', $currentUser->id);
        })->first();
        
        if (!$match) {
            return response()->json([
                'success' => false,
                'message' => 'Match non trouvé'
            ], 404);
        }
        
        $match->accept();
        
        return response()->json([
            'success' => true,
            'message' => 'Match accepté'
        ]);
    }

    /**
     * Refuser un match
     */
    public function decline(User $user)
    {
        $currentUser = auth()->user();
        
        $match = Matching::where(function($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('matched_user_id', $user->id);
        })->first();
        
        if (!$match) {
            return response()->json([
                'success' => false,
                'message' => 'Match non trouvé'
            ], 404);
        }
        
        $match->decline();
        
        return response()->json([
            'success' => true,
            'message' => 'Match refusé'
        ]);
    }

    /**
     * Bloquer un match
     */
    public function block(User $user)
    {
        $currentUser = auth()->user();
        
        $match = Matching::where(function($q) use ($currentUser, $user) {
            $q->where('user_id', $currentUser->id)->where('matched_user_id', $user->id);
        })->orWhere(function($q) use ($currentUser, $user) {
            $q->where('user_id', $user->id)->where('matched_user_id', $currentUser->id);
        })->first();
        
        if ($match) {
            $match->block();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur bloqué'
        ]);
    }
}