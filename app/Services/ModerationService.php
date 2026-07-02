<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * ModerationService
 * ---------------------------------------------------------------------------
 * Actions de modération réservées aux administrateurs. Extrait cette logique
 * du God-Controller `AdminController` (SRP) et constitue le SEUL point
 * d'écriture des champs sensibles de sécurité :
 *   suspended_until, suspension_reason, email_verified_at, phone_verified_at.
 *
 * Tous ces champs sont hors `$fillable` et écrits via `forceFill()`.
 * Les opérations multi-écritures sont encapsulées dans une transaction.
 */
class ModerationService
{
    /**
     * Suspend un utilisateur pour N jours :
     *  - pose la date de fin de suspension + la raison,
     *  - révoque ses tokens/sessions,
     *  - désactive ses annonces (retrait de la visibilité publique).
     */
    public function suspend(User $user, int $days, ?string $reason = null): void
    {
        DB::transaction(function () use ($user, $days, $reason) {
            $user->forceFill([
                'suspended_until'   => Carbon::now()->addDays($days),
                'suspension_reason' => $reason,
            ])->save();

            // Révoquer les jetons d'accès actifs (déconnexion immédiate).
            $user->tokens()->delete();

            // `update()` du query builder = UPDATE SQL direct (n'utilise pas $fillable).
            $user->listings()->update(['status' => 'inactive']);
        });
    }

    /**
     * Lève la suspension d'un utilisateur.
     */
    public function lift(User $user): void
    {
        $user->forceFill([
            'suspended_until'   => null,
            'suspension_reason' => null,
        ])->save();
    }

    /**
     * Valide manuellement un utilisateur (email + téléphone + identité).
     */
    public function verify(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->forceFill([
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ])->save();

            if ($user->profile) {
                $user->profile->forceFill([
                    'is_identity_verified' => true,
                    'identity_verified_at' => now(),
                ])->save();
                $user->profile->addBadge('identity_verified');
            }
        });
    }

    /**
     * Supprime (soft delete) un compte et nettoie ses fichiers associés.
     */
    public function deleteAccount(User $user): void
    {
        DB::transaction(function () use ($user) {
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }
            if ($user->profile && $user->profile->id_document_path) {
                Storage::delete($user->profile->id_document_path);
            }

            $user->delete(); // soft delete
        });
    }
}
