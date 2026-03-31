<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['room', 'apartment', 'looking_for_roommate']);
            $table->string('title');
            $table->text('description');
            
            // Prix et disponibilité
            $table->decimal('price', 10, 2);
            $table->boolean('price_is_negotiable')->default(false);
            $table->date('available_from');
            $table->date('available_until')->nullable();
            
            // Localisation
            $table->string('city');
            $table->string('neighborhood')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Caractéristiques du logement
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->boolean('furnished')->default(false);
            $table->json('amenities')->nullable(); // ['wifi', 'parking', 'ac', etc.]
            $table->json('house_rules')->nullable(); // ['no_smoking', 'no_pets', etc.]
            
            // Photos
            $table->json('photos')->nullable(); // Jusqu'à 10 photos
            $table->string('main_photo')->nullable();
            
            // Statut
            $table->enum('status', ['active', 'inactive', 'rented', 'expired'])->default('active');
            $table->integer('views_count')->default(0);
            $table->integer('contacts_count')->default(0);
            
            // Premium
            $table->boolean('is_featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->boolean('is_urgent')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['city', 'price', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};