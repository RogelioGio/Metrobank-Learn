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
        Schema::table('course_enrollment_status_count', function (Blueprint $table) {
            $table->dropColumn('failed_count');
            $table->dropColumn('past-due_count');
            $table->integer('past_due_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_enrollment_status_count', function (Blueprint $table) {
            $table->integer('failed_count')->default(0);
            
        });
    }
};
