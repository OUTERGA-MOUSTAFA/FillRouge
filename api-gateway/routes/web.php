<?php

use App\Services\ApiGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');   // هادي هي الصفحة اللي كتحمل React
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');   // مهم: باش كل الروابط ( /login , /register , /setup-profile ) ترجع لـ React


Route::prefix('v1')->group(function () {

    // ======================
    // Public Auth Routes
    // ======================
    Route::post('/auth/register', function (Request $request) {
        return app(ApiGatewayService::class)->forwardTo('auth', $request);
    });

    Route::post('/auth/login', function (Request $request) {
        return app(ApiGatewayService::class)->forwardTo('auth', $request);
    });

    // ======================
    // Protected Routes
    // ======================
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/auth/logout', function (Request $request) {
            return app(ApiGatewayService::class)->forwardTo('auth', $request);
        });

        Route::get('/user', function (Request $request) {
            return response()->json($request->user());
        });
    });
});

require __DIR__.'/settings.php';
