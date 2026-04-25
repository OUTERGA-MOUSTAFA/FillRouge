<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;

class PaymentService
{
    /**
     * Traitement de paiement via CMI (Centre Monétique Interbancaire)
     */
    public function processCMIPayment($amount, $cardData, $userData)
    {
        // Configuration CMI
        $merchantId = config('services.cmi.merchant_id');
        $storeKey = config('services.cmi.store_key');

        // Générer un ID de transaction unique
        $orderId = 'Semsar_' . uniqid();// uuid

        // Préparer les données pour le paiement
        $paymentData = [
            'MerchantId' => $merchantId,
            'OrderId' => $orderId,
            'Amount' => $amount * 100, // En centimes
            'Currency' => 'MAD',
            'CardNumber' => $cardData['number'],
            'CardExpiry' => $cardData['expiry'],
            'CardCvv' => $cardData['cvv'],
            'CustomerEmail' => $userData['email'],
            'CustomerName' => $userData['name'],
            'CustomerPhone' => $userData['phone'],
            'ReturnUrl' => config('services.cmi.return_url'),
        ];

        // Signature HMAC
        $hashStr = $this->generateCMIHash($paymentData, $storeKey);
        $paymentData['Hash'] = $hashStr;

        try {
            // Appel à l'API CMI
            $response = Http::asForm()->post('https://cmi-gateway.com/api/payment', $paymentData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'transaction_id' => $response->json('TransactionId'),
                    'order_id' => $orderId,
                    'status' => $response->json('Status'),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json('ErrorMessage') ?? 'Erreur de paiement',
            ];
        } catch (\Exception $e) {
            Log::error('CMI Payment Error: ' . $e->getMessage());// les logs système

            return [
                'success' => false,
                'error' => 'Erreur de connexion au service de paiement',
            ];
        }
    }

    /**
     * Traitement de paiement via Stripe
     */
    public function processStripePayment($amount, $paymentMethodId, $user)
    {
        try {
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $amount * 100,
                'currency' => 'mad',
                'payment_method' => $paymentMethodId,
                'confirmation_method' => 'manual',
                'confirm' => true,
                'return_url' => config('services.stripe.return_url'),
                'metadata' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ],
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'status' => $paymentIntent->status,
                'transaction_id' => $paymentIntent->id,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe Payment Error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function generateCMIHash($data, $storeKey)
    {
        $hashStr = '';
        ksort($data);

        foreach ($data as $key => $value) {
            if ($key !== 'Hash' && $value !== '') {
                $hashStr .= strlen($value) . $value;
            }
        }

        return hash_hmac('sha256', $hashStr, $storeKey);
    }

    /**
     * Vérifier le statut d'un paiement
     */
    public function checkPaymentStatus($transactionId)
    {

        try {
            $session = Session::retrieve($transactionId);
            // Implémentation selon le fournisseur
            return [
                // 'status' => 'completed',
                // 'amount' => null,
                // 'currency' => 'MAD',
                'status' => $session->payment_status,
                'customer' => $session->customer,
                'subscription' => $session->subscription
            ];
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification'
            ], 500);
        }
    }
}
