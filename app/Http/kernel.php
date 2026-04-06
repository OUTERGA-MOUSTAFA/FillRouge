<?php

protected $routeMiddleware = [
    'verified.email' => \App\Http\Middleware\VerifiedEmail::class,
    'verified.phone' => \App\Http\Middleware\VerifiedPhone::class,
    'verified.identity' => \App\Http\Middleware\VerifiedIdentity::class,
    'premium' => \App\Http\Middleware\PremiumUser::class,
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
    'rateLimit.messages' => \App\Http\Middleware\RateLimitMessages::class,
];

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/', 'sanctum/csrf-cookie'],

    'allowed_methods' => [''],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173/')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [''],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];