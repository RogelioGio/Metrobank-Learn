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
        Schema::table('course_userinfo_assignment', function (Blueprint $table) {
            $table->foreignId('distributor_id')->constrained('userInfo')->nullable()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_assignment', function (Blueprint $table) {
            $table->dropConstrainedForeignId('distributor_id');
        });
    }
};
