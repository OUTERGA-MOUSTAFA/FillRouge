<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Plans d'abonnement disponibles
     */
    public function plans()
    {
        $plans = [
            'free' => [
                'name' => 'Gratuit',
                'price' => 0,
                'price_mad' => '0 MAD',
                'features' => [
                    'Profil de base',
                    '2 annonces maximum',
                    '5 messages par jour',
                    'Recherche basique',
                    'Support par email',
                ],
                'limitations' => [
                    'max_ads' => 2,
                    'max_messages_per_day' => 5,
                    'featured_profile' => false,
                    'advanced_filters' => false,
                    'priority_support' => false,
                ]
            ],
            'standard' => [
                'name' => 'Standard',
                'price' => 99,
                'price_mad' => '99 MAD/mois',
                'features' => [
                    'Tout ce qui est dans Gratuit',
                    '10 annonces maximum',
                    '50 messages par jour',
                    'Filtres avancés',
                    'Profil mis en avant',
                    'Voir qui a consulté votre profil',
                    'Support prioritaire',
                    'Sans publicités',
                ],
                'limitations' => [
                    'max_ads' => 10,
                    'max_messages_per_day' => 50,
                    'featured_profile' => true,
                    'advanced_filters' => true,
                    'priority_support' => true,
                ]
            ],
            'premium' => [
                'name' => 'Premium',
                'price' => 199,
                'price_mad' => '199 MAD/mois',
                'features' => [
                    'Tout ce qui est dans Standard',
                    'Annonces illimitées',
                    'Messages illimités',
                    'Badge "Premium"',
                    'Background check offert (1/an)',
                    'Vérification de revenus incluse',
                    'Support VIP 24/7',
                    'Statistiques avancées',
                ],
                'limitations' => [
                    'max_ads' => -1,
                    'max_messages_per_day' => -1,
                    'featured_profile' => true,
                    'advanced_filters' => true,
                    'priority_support' => true,
                    'free_background_check' => 1,
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Abonnement actuel de l'utilisateur
     */
    public function current(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('ends_at', '>', now())
            ->latest()
            ->first();

        $remainingDays = 0;
        if ($subscription && $subscription->ends_at) {
            $remainingDays = now()->diffInDays($subscription->ends_at, false);
            if ($remainingDays < 0) $remainingDays = 0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'current_plan' => $user->subscription_plan,
                'subscription' => $subscription,
                'remaining_days' => $remainingDays,
                'is_premium' => $user->is_premium,
                'benefits' => [
                    'remaining_ads' => $user->getRemainingAds(),
                    'remaining_messages_today' => $user->getRemainingMessagesToday(),
                    'can_feature_listings' => $user->is_premium,
                ]
            ]
        ]);
    }

    /**
     * Initier un paiement - VERSION TEST (sans intégration paiement réelle)
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan' => 'required|in:standard,premium',
            'payment_method' => 'required|in:stripe,cmi,cih',
            'auto_renew' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Vérifier si l'utilisateur n'a pas déjà un abonnement actif
        $existingSubscription = Subscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('ends_at', '>', now())
            ->first();

        if ($existingSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà un abonnement actif',
                'data' => [
                    'current_plan' => $existingSubscription->plan,
                    'ends_at' => $existingSubscription->ends_at,
                ]
            ], 400);
        }

        // Prix selon le plan
        $amount = $request->plan === 'standard' ? 99 : 199;

        //  SIMULATION DE PAIEMENT RÉUSSI (pour les tests)
        $paymentResult = [
            'success' => true,
            'transaction_id' => 'test_' . uniqid(),
            'status' => 'completed'
        ];

        // Créer l'abonnement
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $request->plan,
            'amount' => $amount,
            'payment_method' => $request->payment_method,
            'payment_id' => $paymentResult['transaction_id'],
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'is_active' => true,
            'auto_renew' => $request->auto_renew ?? false,
        ]);

        // Activer l'abonnement
        $subscription->activate();

        return response()->json([
            'success' => true,
            'message' => 'Abonnement activé avec succès',
            'data' => [
                'subscription' => $subscription,
                'payment' => $paymentResult,
            ]
        ]);
    }

    /**
     * Annuler l'abonnement
     */
    public function cancel(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('ends_at', '>', now())
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun abonnement actif trouvé'
            ], 404);
        }

        $subscription->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Abonnement annulé. Vous pourrez utiliser les fonctionnalités premium jusqu\'au ' . $subscription->ends_at->format('d/m/Y'),
            'data' => [
                'ends_at' => $subscription->ends_at,
                'auto_renew' => false,
            ]
        ]);
    }

    /**
     * Webhook Stripe/CMI
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();
        $provider = $payload['provider'] ?? 'stripe';
        $event = $payload['event'] ?? null;

        switch ($event) {
            case 'payment.succeeded':
                $paymentId = $payload['payment_id'];
                break;
            case 'subscription.renewed':
                $subscriptionId = $payload['subscription_id'];
                $subscription = Subscription::find($subscriptionId);
                if ($subscription && $subscription->auto_renew) {
                    // Logique de renouvellement
                }
                break;
            case 'payment.failed':
                // Notifier l'utilisateur
                break;
        }

        return response()->json(['status' => 'ok']);
    }
}