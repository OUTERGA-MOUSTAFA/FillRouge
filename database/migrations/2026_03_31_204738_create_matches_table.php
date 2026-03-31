<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('matched_user_id')->constrained('users')->onDelete('cascade');
            $table->float('compatibility_score')->nullable();
            $table->json('common_interests')->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined', 'blocked'])->default('pending');
            $table->timestamp('matched_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'matched_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};