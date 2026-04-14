<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $provider;
    
    public function __construct()
    {
        $this->provider = config('services.sms.provider', 'twilio');
    }
    
    public function send($phoneNumber, $message)
    {
        // Pour Twilio
        if ($this->provider === 'twilio') {
            return $this->sendViaTwilio($phoneNumber, $message);
        }
        
        // Pour API marocaine (Orange, Inwi, etc.)
        if ($this->provider === 'maroc') {
            return $this->sendViaMoroccanAPI($phoneNumber, $message);
        }
        
        // Mode log pour développement
        Log::info("SMS envoyé à {$phoneNumber}: {$message}");
        return true;
    }
    
    protected function sendViaTwilio($phoneNumber, $message)
    {
        $twilioSid = config('services.twilio.sid');
        $twilioToken = config('services.twilio.token');
        $twilioFrom = config('services.twilio.from');
        
        $phoneNumber = $this->formatPhoneNumber($phoneNumber);
        
        try {
            $response = Http::asForm()->withBasicAuth($twilioSid, $twilioToken)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json", [
                    'To' => $phoneNumber,
                    'From' => $twilioFrom,
                    'Body' => $message,
                ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Twilio SMS error: ' . $e->getMessage());
            return false;
        }
    }
    
    protected function sendViaMoroccanAPI($phoneNumber, $message)
    {
        // Intégration avec une API marocaine (Orange SMS, Inwi, etc.)
        $apiKey = config('services.sms.maroc_api_key');
        $apiUrl = config('services.sms.maroc_api_url');
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, [
                'to' => $this->formatPhoneNumber($phoneNumber),
                'message' => $message,
                'sender' => 'DARNA',
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Moroccan SMS API error: ' . $e->getMessage());
            return false;
        }
    }
    
    protected function formatPhoneNumber($phone)
    {
        // Nettoyer le numéro
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Format international pour le Maroc
        if (substr($phone, 0, 1) === '0') {
            $phone = '+212' . substr($phone, 1);
        }
        
        if (substr($phone, 0, 3) === '212') {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }
    
    public function generateOtp($length = 6)
    {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }
}