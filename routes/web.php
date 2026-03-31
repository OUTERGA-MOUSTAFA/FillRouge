<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;

// ========== ROUTES PUBLIQUES ==========
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/verify-phone', [AuthController::class, 'verifyPhone']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
});

// Annonces publiques
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::get('/listings/search', [ListingController::class, 'search']);

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
    
    // Annonces
    Route::get('/my-listings', [ListingController::class, 'myListings']);
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
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
    Route::post('/subscription/webhook', [PaymentController::class, 'webhook'])->withoutMiddleware('auth:sanctum');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
});

// ========== ROUTES ADMIN (MIDDLEWARE ADMIN) ==========
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'showUser']);
    Route::put('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
    Route::put('/users/{user}/verify', [AdminController::class, 'verifyUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    
    Route::get('/listings', [AdminController::class, 'listings']);
    Route::delete('/listings/{listing}', [AdminController::class, 'deleteListing']);
    
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::put('/reports/{report}/resolve', [AdminController::class, 'resolveReport']);
    
    Route::get('/stats', [AdminController::class, 'statistics']);
});