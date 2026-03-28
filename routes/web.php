<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes (مثلاً login/register غادي يروح للـ Auth Service)
    Route::post('/auth/login', function (Request $request) {
        // هنا غادي نforward الطلب للـ Auth Service (port 5001)
        // مؤقتاً نرجع رسالة
        return response()->json(['message' => 'Login will be forwarded to Auth Service :5001']);
    });

    // Protected routes (بعد ما يدخل المستخدم)
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Forwarding للـ Listing Service
        Route::prefix('listing')->group(function () {
            Route::any('{any}', function (Request $request, $any) {
                // هنا غادي نكتب دالة forward
                return response()->json(['service' => 'listing', 'path' => $any]);
            })->where('any', '.*');
        });

        // Forwarding للـ Payment Service
        Route::prefix('payment')->group(function () {
            Route::any('{any}', function (Request $request, $any) {
                return response()->json(['service' => 'payment', 'path' => $any]);
            })->where('any', '.*');
        });

    });
});