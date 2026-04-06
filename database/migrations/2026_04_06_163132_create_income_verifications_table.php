<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('income_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'verified', 'rejected', 'expired'])->default('pending');
            $table->decimal('declared_income', 10, 2)->nullable();
            $table->string('document_path')->nullable();
            $table->string('document_type')->nullable(); // 'pay_stub', 'tax_return', 'employment_letter', 'bank_statement'
            $table->string('employer_name')->nullable();
            $table->string('job_title')->nullable();
            $table->integer('employment_duration_months')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income_verifications');
    }
};