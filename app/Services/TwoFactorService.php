<?php

namespace App\Services;

use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TwoFactorService
{
    /**
     * Générer un secret pour 2FA (TOTP)
     */
    public function generateSecret()
    {
        // Générer un secret aléatoire (base32 encoding)
        $secret = $this->generateBase32Secret();
        
        return $secret;
    }
    
    /**
     * Générer un secret en base32
     */
    private function generateBase32Secret($length = 16)
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        
        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        
        return $secret;
    }
    
    /**
     * Générer l'URI pour Google Authenticator
     */
    public function getQRCodeUrl($email, $secret, $company = 'RoomMateMorocco')
    {
        return "otpauth://totp/{$company}:{$email}?secret={$secret}&issuer={$company}";
    }
    
    /**
     * Générer le QR code en base64
     */
    public function generateQRCode($email, $secret)
    {
        $url = $this->getQRCodeUrl($email, $secret);
        
        return QrCode::size(200)->generate($url);
    }
    
    /**
     * Vérifier le code TOTP (algorithme manuel)
     */
    public function verifyCode($secret, $code)
    {
        // Implémentation simple de TOTP (RFC 6238)
        // En production, utilisez une bibliothèque testée
        $timeWindow = floor(time() / 30);
        
        for ($i = -1; $i <= 1; $i++) {
            $time = $timeWindow + $i;
            $expectedCode = $this->generateTOTP($secret, $time);
            
            if ($expectedCode === $code) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Générer le code TOTP (version simplifiée)
     * Note: Cette implémentation est simplifiée pour l'apprentissage
     */
    private function generateTOTP($secret, $time)
    {
        // Convertir le secret base32 en bytes
        $secretBytes = $this->base32Decode($secret);
        
        // Paquet du temps en 8 bytes
        $timeBytes = pack('J', $time);
        
        // HMAC-SHA1
        $hash = hash_hmac('sha1', $timeBytes, $secretBytes, true);
        
        // Offset (dernier 4 bits du hash)
        $offset = ord($hash[19]) & 0xf;
        
        // Récupérer 4 bytes à partir de l'offset
        $truncatedHash = unpack('N', substr($hash, $offset, 4))[1] & 0x7fffffff;
        
        // Code à 6 chiffres
        $code = $truncatedHash % 1000000;
        
        return str_pad($code, 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Décoder le base32 (implémentation simple)
     */
    private function base32Decode($base32)
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32 = strtoupper($base32);
        $length = strlen($base32);
        $bits = '';
        $result = '';
        
        for ($i = 0; $i < $length; $i++) {
            $char = $base32[$i];
            $value = strpos($alphabet, $char);
            if ($value !== false) {
                $bits .= str_pad(decbin($value), 5, '0', STR_PAD_LEFT);
            }
        }
        
        for ($i = 0; $i < strlen($bits) - 4; $i += 8) {
            $byte = substr($bits, $i, 8);
            $result .= chr(bindec($byte));
        }
        
        return $result;
    }
    
    /**
     * Générer des codes de récupération
     */
    public function generateRecoveryCodes($count = 8)
    {
        $codes = [];
        
        for ($i = 0; $i < $count; $i++) {
            $codes[] = Str::upper(Str::random(10));
        }
        
        return $codes;
    }
}