<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiKey;
    protected $apiSecret;
    protected $sender;
    
    public function __construct()
    {
        // Configuration pour un service SMS marocain (ex: Orange, Inwi, ou API Gateway)
        $this->apiKey = config('services.sms.api_key');
        $this->apiSecret = config('services.sms.api_secret');
        $this->sender = config('services.sms.sender', 'RoomMate');
    }
    
    /**
     * Envoyer un SMS via API REST (simulé pour le développement)
     */
    public function send($phoneNumber, $message)
    {
        // En développement, on simule l'envoi
        if (app()->environment('local')) {
            Log::info("SMS envoyé à {$phoneNumber}: {$message}");
            return true;
        }
        
        // En production, appeler l'API réelle
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.sms-provider.com/send', [
                'to' => $this->formatPhoneNumber($phoneNumber),
                'from' => $this->sender,
                'text' => $message,
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Erreur envoi SMS: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Formater le numéro marocain (+212)
     */
    private function formatPhoneNumber($phone)
    {
        // Supprimer les espaces et caractères spéciaux
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Si le numéro commence par 0, remplacer par +212
        if (substr($phone, 0, 1) === '0') {
            $phone = '+212' . substr($phone, 1);
        }
        
        // Si le numéro commence par 212 sans +
        if (substr($phone, 0, 3) === '212') {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }
    
    /**
     * Générer un code OTP
     */
    public function generateOtp($length = 6)
    {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }
}