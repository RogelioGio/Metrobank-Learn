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
        Schema::table('zconnect_created_courses', function (Blueprint $table) {
            DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check;');

            DB::statement("
                ALTER TABLE zconnect_created_courses
                ADD CONSTRAINT zconnect_created_courses_coursestatus_check
                CHECK (\"CourseStatus\" IN ('created', 'ondevelopment', 'draft', 'reviewed', 'published', 'archived', 'deleted'))
            ");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_created_courses', function (Blueprint $table) {
            DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check;');

            DB::statement("
                ALTER TABLE zconnect_created_courses
                ADD CONSTRAINT zconnect_created_courses_coursestatus_check
                CHECK (\"CourseStatus\" IN ('created', 'ondevelopment', 'draft', 'published', 'archived', 'deleted'))
            ");
        });
    }
};
