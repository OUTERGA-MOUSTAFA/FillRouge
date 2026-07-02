<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * UserProvisioningService
 * ---------------------------------------------------------------------------
 * Centralise la CRÉATION d'un utilisateur (inscription classique ou via un
 * provider OAuth) en séparant strictement :
 *   - les champs sûrs, mass-assignables (nom, email, téléphone…),
 *   - les champs de privilège (`role`, vérifications) écrits via `forceFill()`.
 *
 * Cela évite qu'un `User::create($request->all())` puisse un jour injecter
 * `role => 'admin'`, et retire cette logique des controllers (SRP).
 */
class UserProvisioningService
{
    public function __construct(private SubscriptionService $subscriptions) {}

    /**
     * Inscription classique (email + mot de passe).
     *
     * @param array<string,mixed> $data Données DÉJÀ validées (voir RegisterRequest).
     * @param string              $role 'chercheur' | 'semsar'
     */
    public function registerLocal(array $data, string $role): User
    {
        $user = new User();

        // Uniquement des champs sûrs (présents dans $fillable).
        $user->fill([
            'full_name'  => $data['full_name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'],
            'password'   => Hash::make($data['password']),
            'gender'     => $data['gender']     ?? null,
            'birth_date' => $data['birth_date'] ?? null,
        ]);

        // Champ de privilège : jamais mass-assigné.
        $user->forceFill(['role' => $role])->save();

        // Abonnement gratuit par défaut (quota d'annonces inclus).
        $this->subscriptions->initializeFree($user);

        return $user;
    }

    /**
     * Inscription via un provider OAuth (Google, Facebook…).
     * L'email est considéré vérifié car garanti par le provider.
     *
     * @param array{name:string,email:string,avatar?:string|null} $data
     * @param string $role Rôle par défaut pour les inscriptions sociales.
     */
    public function registerFromProvider(array $data, string $role = 'chercheur'): User
    {
        $user = new User();

        $user->fill([
            'full_name' => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make(Str::random(32)), // mot de passe aléatoire non utilisé
            'avatar'    => $data['avatar'] ?? null,
        ]);

        $user->forceFill([
            'role'              => $role,
            'email_verified_at' => now(),
        ])->save();

        $this->subscriptions->initializeFree($user);

        return $user;
    }
}
