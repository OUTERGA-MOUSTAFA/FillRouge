<?php

namespace App\Providers;

use App\Models\Listing;
use App\Models\Message;
use App\Models\Review;
use App\Models\User;
use App\Policies\ListingPolicy;
use App\Policies\MessagePolicy;
use App\Policies\ReviewPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Listing::class => ListingPolicy::class,
        Message::class => MessagePolicy::class,
        Review::class => ReviewPolicy::class,
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}