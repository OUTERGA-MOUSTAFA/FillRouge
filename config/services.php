<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'background_check' => [
        'provider' => env('BACKGROUND_CHECK_PROVIDER', 'checkr'),
        'api_key' => env('BACKGROUND_CHECK_API_KEY'),
        'api_secret' => env('BACKGROUND_CHECK_API_SECRET'),
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
    ],

    'sms' => [
        'provider' => env('SMS_PROVIDER', 'log'), // twilio, maroc, log
        'maroc_api_key' => env('MAROC_SMS_API_KEY'),
        'maroc_api_url' => env('MAROC_SMS_API_URL'),
    ],

    'stripe' => [
        'key' => env('STRIPE_PUBLIC_KEY'),
        'secret' => env('STRIPE_SECRET_KEY'),
        'webhook' => [
            'secret' => env('STRIPE_WEBHOOK_SECRET'),
        ],
        'plans' => [
            'standard' => [
                'name' => 'Standard',
                'price_id' => 'price_1TOlveF3pzj3NXxdJ9i53Cia', // À créer dans Stripe
                // 'amount' => 99,
                // 'interval' => 'month',
            ],
            'premium' => [
                'name' => 'Premium',
                'price_id' => 'price_1TOlweF3pzj3NXxd3j4t26KM',
                // 'amount' => 199,
                // 'interval' => 'month',// kaynin f strip
            ],
        ],
        // 'cmi' => [
        //     'merchant_id' => env('CMI_MERCHANT_ID'),
        //     'store_key' => env('CMI_STORE_KEY'),
        //     'return_url' => env('APP_URL') . '/payment/callback',
        //     'gateway_url' => env('CMI_GATEWAY_URL', 'https://payment.cmi.co.ma/fim/est3Dgate'),
        // ],
    ],

];
