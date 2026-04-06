<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('background_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'expired'])->default('pending');
            $table->string('provider')->nullable(); // 'checkr', 'certn', 'sterling'
            $table->string('provider_check_id')->nullable();
            $table->enum('result', ['clear', 'consider', 'unclear'])->nullable();
            $table->json('report_data')->nullable();
            $table->json('checks_performed')->nullable(); // ['criminal', 'education', 'employment', 'identity']
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('background_checks');
    }
};