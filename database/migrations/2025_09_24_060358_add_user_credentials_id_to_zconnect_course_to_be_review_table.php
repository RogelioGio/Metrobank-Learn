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
        Schema::table('zconnect_course_to_be_review', function (Blueprint $table) {
            $table->unsignedBigInteger('user_credentials_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_course_to_be_review', function (Blueprint $table) {
            $table->dropColumn('user_credentials_id');
        });
    }
};
