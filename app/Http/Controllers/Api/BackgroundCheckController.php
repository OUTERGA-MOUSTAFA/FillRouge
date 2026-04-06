<?php

namespace App\Http\Controllers;

use App\Models\BackgroundCheck;
use App\Services\BackgroundCheckService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BackgroundCheckController extends Controller
{
    protected $backgroundCheckService;
    
    public function __construct(BackgroundCheckService $backgroundCheckService)
    {
        $this->backgroundCheckService = $backgroundCheckService;
    }
    
    /**
     * Initier un background check
     */
    public function initiate(Request $request)
    {
        $user = $request->user();
        
        // Vérifier si l'utilisateur a un abonnement premium
        if (!$user->is_premium) {
            return response()->json([
                'success' => false,
                'message' => 'Le background check est une fonctionnalité premium',
                'upgrade_required' => true
            ], 403);
        }
        
        // Vérifier si déjà vérifié
        $existingValid = BackgroundCheck::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('result', 'clear')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->first();
            
        if ($existingValid) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà un background check valide',
                'data' => ['expires_at' => $existingValid->expires_at]
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'checks' => 'nullable|array',
            'checks.*' => 'string|in:criminal,education,employment,identity',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $checks = $request->checks ?? ['criminal', 'identity'];
        
        $result = $this->backgroundCheckService->initiateCheck($user, $checks);
        
        if (!$result['success']) {
            return response()->json($result, 400);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Background check initié',
            'data' => $result['data']
        ]);
    }
    
    /**
     * Vérifier le statut
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        $backgroundCheck = BackgroundCheck::where('user_id', $user->id)
            ->latest()
            ->first();
            
        if (!$backgroundCheck) {
            return response()->json([
                'success' => true,
                'data' => ['status' => 'not_initiated']
            ]);
        }
        
        // Mettre à jour le statut si en cours
        if (in_array($backgroundCheck->status, ['pending', 'processing'])) {
            $this->backgroundCheckService->checkStatus($backgroundCheck);
            $backgroundCheck->refresh();
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'status' => $backgroundCheck->status,
                'result' => $backgroundCheck->result,
                'is_clear' => $backgroundCheck->is_clear,
                'is_valid' => $backgroundCheck->is_valid,
                'checks_performed' => $backgroundCheck->checks_performed,
                'started_at' => $backgroundCheck->started_at,
                'completed_at' => $backgroundCheck->completed_at,
                'expires_at' => $backgroundCheck->expires_at,
            ]
        ]);
    }
    
    /**
     * Webhook pour les mises à jour
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();
        
        $handled = $this->backgroundCheckService->handleWebhook($payload);
        
        if (!$handled) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }
        
        return response()->json(['status' => 'ok']);
    }
}