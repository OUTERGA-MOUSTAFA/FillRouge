<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SetLocale
 * ---------------------------------------------------------------------------
 * Fixe la langue de l'application pour la requête courante à partir de
 * l'en-tête `Accept-Language` envoyé par le frontend (qui reflète la langue
 * choisie dans le sélecteur i18n).
 *
 * Toutes les réponses traduites via __() / trans() (messages d'erreur, etc.)
 * sortent alors dans la langue de l'utilisateur.
 */
class SetLocale
{
    /** Langues supportées (la 1re est la valeur par défaut si aucune ne correspond). */
    private const SUPPORTED = ['fr', 'en', 'ar'];

    public function handle(Request $request, Closure $next): Response
    {
        // getPreferredLanguage négocie la meilleure langue supportée depuis
        // l'en-tête Accept-Language ; renvoie 'fr' par défaut si rien ne correspond.
        $locale = $request->getPreferredLanguage(self::SUPPORTED);

        if (in_array($locale, self::SUPPORTED, true)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
