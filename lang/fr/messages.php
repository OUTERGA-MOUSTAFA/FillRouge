<?php

/**
 * Messages d'API localisés (FR).
 * Utilisés via __('messages.<clé>') dans les controllers/services.
 */
return [
    'auth' => [
        'invalid_credentials' => 'Email ou mot de passe incorrect',
        'twofactor_required'  => 'Code 2FA requis',
        'twofactor_expired'   => 'Session 2FA expirée',
        'twofactor_invalid'   => 'Code 2FA invalide',
        'logged_out'          => 'Déconnecté',
        'register_success'    => 'Inscription réussie. Veuillez vérifier votre email et téléphone.',
        'email_verified'      => 'Email vérifié',
        'phone_verified'      => 'Téléphone vérifié',
        'code_invalid'        => 'Code invalide ou expiré',
    ],

    'demand' => [
        'not_authorized'    => "Vous n'êtes pas autorisé à répondre à cette demande.",
        'already_responded' => 'Cette demande a déjà reçu une réponse.',
        'accepted'          => 'Demande acceptée',
        'refused'           => 'Demande refusée',
    ],

    'favorite' => [
        'added'   => 'Ajouté aux favoris',
        'removed' => 'Retiré des favoris',
    ],

    'common' => [
        'unauthorized' => 'Action non autorisée.',
        'not_found'    => 'Ressource introuvable.',
        'server_error' => 'Une erreur est survenue. Veuillez réessayer.',
    ],
];
