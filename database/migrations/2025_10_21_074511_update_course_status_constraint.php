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
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS "zconnect_created_courses_CourseStatus_check"');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
