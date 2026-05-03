<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Drop the old constraint
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');

        // Add the new constraint with "for_approval" included
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

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Rollback to the previous constraint (without "for_approval")
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');

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
                    'deleted'
                )
            )
        ");
    }
};
