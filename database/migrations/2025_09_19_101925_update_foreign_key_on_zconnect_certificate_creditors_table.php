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
        Schema::table('zconnect_certificate_creditors', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');

            $table->foreignId('certificate_id')->nullable()->constrained('zconnect_certificates')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_certificate_creditors', function (Blueprint $table) {
            $table->dropForeign(['certificate_id']);
            $table->dropColumn('certificate_id');

            $table->foreignId('course_id')->constrained('zconnect_created_courses')->onDelete('cascade');
        });
    }
};
