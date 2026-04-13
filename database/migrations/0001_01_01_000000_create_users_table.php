<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['chercheur', 'semsar', 'admin'])->default('chercheur');
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();

            $table->json('preferred_languages')->nullable(); // ['ar', 'fr', 'en', 'es']
            $table->json('interests')->nullable(); // ['cooking', 'fitness', 'tech', ...]
            $table->enum('sleep_schedule', ['early_bird', 'night_owl'])->nullable();
            $table->boolean('has_pets')->default(false);
            $table->boolean('is_smoker')->default(false);
            $table->enum('cleanliness_level', ['relaxed', 'very_clean'])->nullable();
            $table->enum('social_level', ['introvert', 'extrovert'])->nullable();
            $table->text('about_me')->nullable(); // Champ "About You"
            $table->string('city')->nullable();
            $table->string('neighborhood')->nullable();

            // Informations personnelles
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('birth_date')->nullable();
            $table->string('profession')->nullable();
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();

            // Sécurité
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();

            // Premium
            $table->enum('subscription_plan', ['free', 'standard', 'premium'])->default('free');
            $table->timestamp('subscription_ends_at')->nullable();
            $table->integer('daily_messages_count')->default(0);
            $table->date('last_message_reset_date')->nullable();
            $table->integer('remaining_ads')->default(2); // Pour le plan gratuit: 2 annonces max
            $table->boolean('is_featured')->default(false);

            // Statistiques
            $table->integer('profile_views')->default(0);
            $table->timestamp('last_seen_at')->nullable();

            // OAuth
            $table->string('provider')->nullable();
            $table->string('provider_id')->nullable();
            $table->text('provider_token')->nullable();
            $table->text('provider_refresh_token')->nullable();

            $table->rememberToken();
            $table->softDeletes(); // Pour la modération

            $table->index(['email', 'phone', 'subscription_plan']);
            $table->timestamp('suspended_until')->nullable();
            $table->text('suspension_reason')->nullable();
            $table->json('notification_preferences')->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
    }
};
