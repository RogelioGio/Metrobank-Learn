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
        // Drop the old constraint if it exists
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');

        // Add the new constraint with "approved" included
        DB::statement("
            ALTER TABLE zconnect_created_courses
            ADD CONSTRAINT zconnect_created_courses_coursestatus_check
            CHECK (
                \"CourseStatus\" IN (
                    'created',
                    'ondevelopment',
                    'draft',
                    'reviewed',
                    'published',
                    'archived',
                    'deleted',
                    'for_approval',
                    'approved'
                )
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the updated constraint
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');

        // Re-add the original constraint without "approved"
        DB::statement("
            ALTER TABLE zconnect_created_courses
            ADD CONSTRAINT zconnect_created_courses_coursestatus_check
            CHECK (
                \"CourseStatus\" IN (
                    'created',
                    'ondevelopment',
                    'draft',
                    'reviewed',
                    'published',
                    'archived',
                    'deleted',
                    'for_approval'
                )
            )
        ");
    }
};
