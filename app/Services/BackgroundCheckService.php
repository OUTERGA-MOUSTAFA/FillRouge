<?php

namespace App\Services;

use App\Models\BackgroundCheck;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BackgroundCheckService
{
    protected $provider;
    protected $apiKey;
    protected $apiSecret;
    
    public function __construct()
    {
        $this->provider = config('services.background_check.provider', 'checkr');
        $this->apiKey = config('services.background_check.api_key');
        $this->apiSecret = config('services.background_check.api_secret');
    }
    
    /**
     * Initier un background check
     */
    public function initiateCheck(User $user, $checks = ['criminal', 'identity'])
    {
        // Vérifier si déjà en cours
        $existing = BackgroundCheck::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing'])
            ->first();
            
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Un background check est déjà en cours',
                'data' => $existing
            ];
        }
        
        // Créer l'enregistrement
        $backgroundCheck = BackgroundCheck::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'provider' => $this->provider,
            'checks_performed' => $checks,
        ]);
        
        // Appeler l'API du provider
        $result = $this->callProviderAPI($user, $checks);
        
        if (!$result['success']) {
            $backgroundCheck->fail($result['error']);
            return $result;
        }
        
        $backgroundCheck->update([
            'status' => 'processing',
            'provider_check_id' => $result['check_id'],
            'started_at' => now(),
        ]);
        
        return [
            'success' => true,
            'message' => 'Background check initié',
            'data' => $backgroundCheck
        ];
    }
    
    /**
     * Vérifier le statut
     */
    public function checkStatus(BackgroundCheck $backgroundCheck)
    {
        // Simulation pour le développement
        if (app()->environment('local')) {
            return $this->simulateCheckStatus($backgroundCheck);
        }
        
        // En production, appeler l'API réelle
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->apiKey . ':'),
            ])->get("https://api.checkr.com/v1/reports/{$backgroundCheck->provider_check_id}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'completed') {
                    $result = $this->interpretResult($data);
                    $backgroundCheck->complete($result['result'], $data);
                }
                
                return [
                    'success' => true,
                    'status' => $data['status'],
                    'result' => $data['status'] === 'completed' ? $result['result'] : null,
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Failed to check status'
            ];
        } catch (\Exception $e) {
            Log::error('Background check status error: ' . $e->getMessage()); //les logs système
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Appeler l'API du provider (Checkr/Certn)
     */
    protected function callProviderAPI(User $user, array $checks)
    {
        // Simulation pour le développement
        if (app()->environment('local')) {
            return [
                'success' => true,
                'check_id' => 'check_' . uniqid(),
                'message' => 'Background check initiated (simulated)'
            ];
        }
        
        // Intégration avec Checkr (exemple)
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->apiKey . ':'),
                'Content-Type' => 'application/json',
            ])->post('https://api.checkr.com/v1/reports', [
                'package' => 'standard',
                'candidate_id' => $this->getOrCreateCandidate($user),
                'screens' => $checks,
            ]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'check_id' => $response->json('id'),
                ];
            }
            
            return [
                'success' => false,
                'error' => $response->json('error') ?? 'API Error'
            ];
        } catch (\Exception $e) {
            Log::error('Background check API error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Créer ou récupérer un candidat chez Checkr
     */
    protected function getOrCreateCandidate(User $user)
    {
        // Implémentation selon la documentation du provider
        return 'candidate_' . $user->id;
    }
    
    /**
     * Interpréter les résultats
     */
    protected function interpretResult($data)
    {
        // Logique d'interprétation des résultats
        $hasIssues = false;
        
        foreach ($data['screens'] ?? [] as $screen) {
            if ($screen['status'] === 'consider') {
                $hasIssues = true;
                break;
            }
        }
        
        return [
            'result' => $hasIssues ? 'consider' : 'clear',
        ];
    }
    
    /**
     * Simulation pour le développement
     */
    protected function simulateCheckStatus(BackgroundCheck $backgroundCheck)
    {
        // Simuler un délai de traitement
        $minutesSinceStart = $backgroundCheck->started_at ? 
            now()->diffInMinutes($backgroundCheck->started_at) : 0;
        
        if ($minutesSinceStart > 2) {
            // Simuler un résultat aléatoire
            $result = rand(1, 10) > 8 ? 'consider' : 'clear';
            
            $backgroundCheck->complete($result, [
                'simulated' => true,
                'checks' => $backgroundCheck->checks_performed,
                'completed_at' => now()->toISOString(),
            ]);
            
            return [
                'success' => true,
                'status' => 'completed',
                'result' => $result,
            ];
        }
        
        return [
            'success' => true,
            'status' => 'processing',
            'result' => null,
        ];
    }
    
    /**
     * Webhook pour recevoir les mises à jour
     */
    public function handleWebhook($payload)
    {
        $checkId = $payload['data']['id'] ?? null;
        
        if (!$checkId) {
            return false;
        }
        
        $backgroundCheck = BackgroundCheck::where('provider_check_id', $checkId)->first();
        
        if (!$backgroundCheck) {
            return false;
        }
        
        $status = $payload['data']['status'] ?? null;
        
        if ($status === 'completed') {
            $result = $this->interpretResult($payload['data']);
            $backgroundCheck->complete($result['result'], $payload['data']);
        } elseif ($status === 'failed') {
            $backgroundCheck->fail($payload['data']['error'] ?? 'Unknown error');
        }
        
        return true;
    }
}
