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
        Schema::table('zconnect_courses', function (Blueprint $table) {
            if (!Schema::hasColumn('zconnect_courses', 'CourseDescription')) {
                $table->text('CourseDescription')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_courses', function (Blueprint $table) {
            $table->dropColumn('CourseDescription');
        });
    }
};
