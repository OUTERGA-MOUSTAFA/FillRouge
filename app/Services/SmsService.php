<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $twilio;
    protected $verifyServiceSid;
    protected $fromNumber;
    
    public function __construct()
    {
        // Initialisation du client Twilio
        $this->twilio = new Client(
            config('services.twilio.account_sid'),
            config('services.twilio.auth_token')
        );
        
        $this->verifyServiceSid = config('services.twilio.verify_sid');
        $this->fromNumber = config('services.twilio.phone_number');
    }
    
    // ====================================================================
    // OPTION 1 : UTILISATION DE TWILIO VERIFY (Recommandé pour l'OTP)
    // ====================================================================

    /**
     * Demander l'envoi d'un code OTP via Twilio Verify
     */
    public function sendOtp($phoneNumber)
    {
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        // En environnement de développement (local), on simule l'envoi pour ne pas consommer de crédit
        if (app()->environment('local')) {
            Log::info("Envoi d'OTP (simulé) pour le numéro : {$formattedPhone}");
            return true;
        }

        try {
            $verification = $this->twilio->verify->v2->services($this->verifyServiceSid)
                ->verifications
                ->create($formattedPhone, "sms"); // Vous pouvez changer "sms" en "whatsapp" ou "call"
            
            return $verification->status === 'pending';
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'envoi de l'OTP via Twilio : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Vérifier si le code saisi par l'utilisateur est correct
     */
    public function checkOtp($phoneNumber, $code)
    {
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        // En environnement local, on accepte toujours le code pour faciliter les tests
        if (app()->environment('local')) {
            Log::info("Vérification du code (simulée) pour le numéro : {$formattedPhone} avec le code : {$code}");
            return true; 
        }

        try {
            $check = $this->twilio->verify->v2->services($this->verifyServiceSid)
                ->verificationChecks
                ->create($code, ['to' => $formattedPhone]);
            
            return $check->status === 'approved';
        } catch (\Exception $e) {
            Log::error("Erreur lors de la vérification de l'OTP : " . $e->getMessage());
            return false;
        }
    }


    // ====================================================================
    // OPTION 2 : SMS CLASSIQUE (Si vous envoyez d'autres messages que des OTP)
    // ====================================================================

    /**
     * Envoyer un SMS classique via Twilio
     */
    public function send($phoneNumber, $message)
    {
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        if (app()->environment('local')) {
            Log::info("SMS envoyé (simulé) au numéro {$formattedPhone} : {$message}");
            return true;
        }

        try {
            $this->twilio->messages->create(
                $formattedPhone, // Numéro du destinataire
                [
                    'from' => $this->fromNumber, // Numéro de l'expéditeur (acheté sur Twilio)
                    'body' => $message
                ]
            );
            
            return true;
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'envoi du SMS via Twilio : " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Formater le numéro marocain au format international E.164 (Requis par Twilio)
     */
    private function formatPhoneNumber($phone)
    {
        // Supprimer les espaces et caractères spéciaux
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Si le numéro commence par 0 (ex: 0612345678), on le remplace par 212
        if (strlen($phone) === 10 && substr($phone, 0, 1) === '0') {
            $phone = '212' . substr($phone, 1);
        }
        
        // S'assurer que le numéro commence par +
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }

    /**
     * @deprecated Plus nécessaire si vous utilisez Twilio Verify (Twilio génère le code lui-même)
     */
    public function generateOtp($length = 6)
    {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }
}
// LCXUCJR6K51DMKCGBHEPXN8P