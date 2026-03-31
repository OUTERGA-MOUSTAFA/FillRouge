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
        Schema::create('user_profiles', function (Blueprint $table) {
              $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Bio et description
            $table->text('bio')->nullable();
            $table->text('description')->nullable();
            
            // Centres d'intérêt (JSON)
            $table->json('interests')->nullable(); // ['cooking', 'fitness', 'tech', etc.]
            
            // Préférences de vie
            $table->enum('smoking', ['yes', 'no', 'occasionally'])->nullable();
            $table->enum('pets', ['yes', 'no', 'maybe'])->nullable();
            $table->enum('sleep_schedule', ['early_bird', 'night_owl', 'flexible'])->nullable();
            $table->enum('cleanliness', ['relaxed', 'moderate', 'very_clean'])->nullable();
            $table->enum('social_level', ['introvert', 'ambivert', 'extrovert'])->nullable();
            $table->enum('occupation', ['student', 'employed', 'self_employed', 'unemployed', 'retired'])->nullable();
            
            // Préférences de colocataire
            $table->enum('preferred_gender', ['male', 'female', 'any'])->default('any');
            $table->integer('preferred_min_age')->nullable();
            $table->integer('preferred_max_age')->nullable();
            $table->boolean('accepts_pets')->default(true);
            $table->boolean('accepts_smokers')->default(true);
            
            // Vérifications
            $table->boolean('is_phone_verified')->default(false);
            $table->boolean('is_email_verified')->default(false);
            $table->boolean('is_identity_verified')->default(false);
            $table->string('id_document_path')->nullable();
            $table->string('id_document_type')->nullable(); // 'cin', 'passport'
            $table->timestamp('identity_verified_at')->nullable();
            $table->boolean('is_background_checked')->default(false);
            $table->timestamp('background_checked_at')->nullable();
            
            // Badges et vérifications
            $table->json('badges')->nullable(); // ['verified', 'premium', 'background_checked']
            
            // Score de compatibilité (calculé)
            $table->float('compatibility_score')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
