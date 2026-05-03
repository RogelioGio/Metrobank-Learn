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
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');
        DB::statement("
            ALTER TABLE zconnect_created_courses ADD CONSTRAINT zconnect_created_courses_coursestatus_check
            CHECK (
                \"CourseStatus\"::text = ANY (
                    ARRAY[
                        'created'::character varying,
                        'ondevelopment'::character varying,
                        'draft'::character varying,
                        'reviewed'::character varying,
                        'published'::character varying,
                        'archived'::character varying,
                        'deleted'::character varying,
                        'for_approval'::character varying,
                        'approved'::character varying,
                        'inactive'::character varying
                    ]
                )
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE zconnect_created_courses DROP CONSTRAINT IF EXISTS zconnect_created_courses_coursestatus_check');
        DB::statement("
            ALTER TABLE zconnect_created_courses ADD CONSTRAINT zconnect_created_courses_coursestatus_check
            CHECK (
                \"CourseStatus\"::text = ANY (
                    ARRAY[
                        'created'::character varying,
                        'ondevelopment'::character varying,
                        'draft'::character varying,
                        'reviewed'::character varying,
                        'published'::character varying,
                        'archived'::character varying,
                        'deleted'::character varying,
                        'for_approval'::character varying,
                        'approved'::character varying
                    ]
                )
            )
        ");
    }
};
