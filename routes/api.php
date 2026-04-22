<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminSliderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackgroundCheckController;
use App\Http\Controllers\Api\IncomeVerificationController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ========== ROUTES PUBLIQUES ==========

// Webhook (sans auth)
Route::post('/subscription/webhook', [PaymentController::class, 'webhook'])->withoutMiddleware('auth:sanctum');

Route::prefix('auth')->group(function () {

    Route::get('/csrf-token', function () {
        return response()->json(['csrf_token' => csrf_token()]);
    });

    // Webhook (pas besoin de middleware auth)
    // Route::post('/stripe/webhook', [StripeController::class, 'handleWebhook']);

    // Route publique pour le frontend
    Route::get('/sliders', [SliderController::class, 'index']);

    // Profils publics
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/users/{user}/reviews', [ReviewController::class, 'userReviews']); // ← Ajouter

    // OAuth
    Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
    Route::get('/auth/facebook/redirect', [SocialAuthController::class, 'redirectToFacebook']);
    Route::get('/auth/facebook/callback', [SocialAuthController::class, 'handleFacebookCallback']);

    Route::post('/register', [AuthController::class, 'register']);
    //    admin role in termenal
    // php artisan tinker
    // $user = new App\Models\User();
    // $user->full_name = "Admin Name";
    // $user->email = "admin@example.com";
    // $user->password = Hash::make('password123');
    // $user->role = 'admin';
    // $user->save();

    // Route de développement - À supprimer en production
    if (app()->environment('local')) {
        Route::get('/dev/last-verification-code', function () {
            return response()->json(['code' => session()->get('last_verification_code')]);
        });
    }

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/verify-phone', [AuthController::class, 'verifyPhone']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
});

// Annonces publiques
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/search', [ListingController::class, 'search']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

// Profils publics
Route::get('/users/{user}', [UserController::class, 'show']);

// ========== ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE) ==========
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [UserController::class, 'me']);
    Route::put('/auth/profile', [UserController::class, 'updateProfile']);
    Route::put('/auth/profile-details', [UserController::class, 'updateProfileDetails']);
    Route::post('/auth/avatar', [UserController::class, 'uploadAvatar']);
    Route::post('/auth/id-document', [UserController::class, 'uploadIdDocument']);
    Route::post('/auth/enable-2fa', [AuthController::class, 'enableTwoFactor']);
    Route::post('/auth/disable-2fa', [AuthController::class, 'disableTwoFactor']);
    Route::post('/auth/verify-2fa', [AuthController::class, 'verifyTwoFactor']);

    // Users
    Route::get('/users/{user}/compatibility', [UserController::class, 'getCompatibilityWith']);
    Route::get('/recommendations', [UserController::class, 'getRecommendations']);
    Route::post('/users/{user}/report', [UserController::class, 'reportUser']);
    Route::delete('/account', [UserController::class, 'deleteAccount']);

    // Recherche
    Route::get('/search/users', [UserController::class, 'search']);
    Route::get('/search/listings', [ListingController::class, 'search']);

    // Stripe routes
    // Route::post('/stripe/create-checkout-session', [StripeController::class, 'createCheckoutSession']);
    // Route::get('/stripe/check-payment-status', [StripeController::class, 'checkPaymentStatus']);
    // Route::post('/stripe/cancel-subscription', [StripeController::class, 'cancelSubscription']);
    // Route::get('/stripe/customer-portal', [StripeController::class, 'getCustomerPortal']);


    // Annonces
    Route::post('/listings', [ListingController::class, 'store']);
    Route::get('/MyListings', [ListingController::class, 'myListings']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
    Route::post('/listings/{listing}/toggle-status', [ListingController::class, 'toggleStatus']);
    Route::post('/listings/{listing}/feature', [ListingController::class, 'makeFeatured']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{user}', [MessageController::class, 'conversation']);
    Route::post('/messages/{user}', [MessageController::class, 'send']);
    Route::put('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    Route::post('/messages/{message}/report', [MessageController::class, 'report']);

    // Matches
    Route::get('/matches', [MatchController::class, 'index']);
    Route::post('/matches/{user}/accept', [MatchController::class, 'accept']);
    Route::post('/matches/{user}/decline', [MatchController::class, 'decline']);
    Route::post('/matches/{user}/block', [MatchController::class, 'block']);

    // Avis
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);
    Route::post('/reviews/{user}', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    // Paiements
    Route::post('/subscription/checkout', [PaymentController::class, 'checkout']);
    Route::get('/subscription/plans', [PaymentController::class, 'plans']);
    Route::get('/subscription/current', [PaymentController::class, 'current']);
    Route::post('/subscription/cancel', [PaymentController::class, 'cancel']);
    Route::post('/subscription/check-status', [PaymentController::class, 'checkPaymentStatus']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Vérification des revenus
    Route::post('/income-verification/submit', [IncomeVerificationController::class, 'submit']);
    Route::get('/income-verification/status', [IncomeVerificationController::class, 'status']);

    // Background check
    Route::post('/background-check/initiate', [BackgroundCheckController::class, 'initiate']);
    Route::get('/background-check/status', [BackgroundCheckController::class, 'status']);
});
// Webhook (public)
Route::post('/webhooks/background-check', [BackgroundCheckController::class, 'webhook']);

// ========== ROUTES ADMIN (MIDDLEWARE ADMIN) ==========
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'showUser']);
    Route::put('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
    Route::put('/users/{user}/verify', [AdminController::class, 'verifyUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);

    Route::get('/listings', [AdminController::class, 'listings']);
    Route::delete('/listings/{listing}', [AdminController::class, 'deleteListing']);
    Route::get('/recent-listings', [AdminController::class, 'recentListings']);
    Route::get('/recent-users', [AdminController::class, 'recentUsers']);
    Route::get('/pending-reports', [AdminController::class, 'pendingReports']);

    Route::get('/reports', [AdminController::class, 'reports']);
    Route::put('/reports/{report}/resolve', [AdminController::class, 'resolveReport']);

    Route::get('/stats', [AdminController::class, 'statistics']);
    Route::get('/stats/advanced', [AdminController::class, 'advancedStats']);

    Route::get('/income-verifications', [IncomeVerificationController::class, 'list']);
    Route::post('/income-verifications/{id}/approve', [IncomeVerificationController::class, 'approve']);
    Route::post('/income-verifications/{id}/reject', [IncomeVerificationController::class, 'reject']);

    Route::put('/users/{user}/unsuspend', [AdminController::class, 'unsuspendUser']);


    // Admin only can add image slider
    // Route::post('/sliders', [SliderController::class, 'store']);
    // Route::put('/sliders/{id}', [SliderController::class, 'update']);
    // Route::delete('/sliders/{id}', [SliderController::class, 'destroy']);
    Route::apiResource('sliders', AdminSliderController::class);
});
