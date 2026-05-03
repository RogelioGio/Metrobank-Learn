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
        Schema::table('zconnect_certificates', function (Blueprint $table) {
            $table->dropColumn(['Grantee', 'AwardedDate', 'CertificatePath']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_certificates', function (Blueprint $table) {
            $table->string('Grantee')->nullable();
            $table->date('AwardedDate')->nullable();
            $table->string('CertificatePath')->nullable();
        });
    }
};
