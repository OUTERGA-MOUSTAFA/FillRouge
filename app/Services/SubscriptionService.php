<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * SubscriptionService
 * ---------------------------------------------------------------------------
 * Point d'écriture UNIQUE du cycle de vie de l'abonnement d'un utilisateur.
 *
 * Les colonnes `subscription_plan`, `subscription_ends_at` et `remaining_ads`
 * sont VOLONTAIREMENT retirées du `$fillable` du modèle User : ce sont des
 * champs de privilège (payants). Les écrire par mass-assignment permettrait à
 * un utilisateur de se sur-classer via une requête forgée. On les modifie donc
 * exclusivement ici, de façon explicite, via `forceFill()`.
 */
class SubscriptionService
{
    /** Quota d'annonces actives autorisées par plan. */
    private const AD_QUOTAS = [
        'free'     => 2,
        'standard' => 10,
        'premium'  => 9999, // pratiquement illimité
    ];

    /** Plans payants valides. */
    private const PAID_PLANS = ['standard', 'premium'];

    /**
     * Initialise (ou réinitialise) un utilisateur sur le plan gratuit.
     * Appelé à l'inscription et lors d'une rétrogradation/expiration.
     */
    public function initializeFree(User $user): void
    {
        $user->forceFill([
            'subscription_plan'    => 'free',
            'subscription_ends_at' => null,
            'remaining_ads'        => self::AD_QUOTAS['free'],
        ])->save();
    }

    /**
     * Active un plan payant après un paiement CONFIRMÉ.
     * À appeler depuis PaymentService/PaymentController une fois la transaction validée.
     *
     * @param string $plan   'standard' | 'premium'
     * @param int    $months Durée de l'abonnement en mois
     */
    public function activate(User $user, string $plan, int $months = 1): void
    {
        abort_unless(in_array($plan, self::PAID_PLANS, true), 422, "Plan d'abonnement invalide : {$plan}");

        // On prolonge à partir de la date d'expiration si l'abonnement est encore actif,
        // sinon on repart de maintenant.
        $start = ($user->subscription_ends_at && $user->subscription_ends_at->isFuture())
            ? $user->subscription_ends_at
            : Carbon::now();

        $user->forceFill([
            'subscription_plan'    => $plan,
            'subscription_ends_at' => $start->copy()->addMonths($months),
            'remaining_ads'        => self::AD_QUOTAS[$plan],
        ])->save();
    }

    /**
     * Rétrograde vers le plan gratuit (annulation ou expiration détectée par un job planifié).
     */
    public function downgradeToFree(User $user): void
    {
        $this->initializeFree($user);
    }
}
