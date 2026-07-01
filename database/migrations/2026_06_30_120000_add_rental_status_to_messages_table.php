<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Statut d'une demande de location.
     * NULL  = message normal (pas une demande)
     * pending / accepted / refused = demande de location et sa réponse
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('rental_status')->nullable()->after('listing_id');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('rental_status');
        });
    }
};
