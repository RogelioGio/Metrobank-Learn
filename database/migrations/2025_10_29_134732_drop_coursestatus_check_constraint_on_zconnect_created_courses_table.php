<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE "zconnect_created_courses" DROP CONSTRAINT IF EXISTS "zconnect_created_courses_CourseStatus_check";');
    }

    public function down(): void
    {
        DB::statement(
            'ALTER TABLE "zconnect_created_courses" 
             ADD CONSTRAINT "zconnect_created_courses_CourseStatus_check" 
             CHECK (("CourseStatus")::text = ANY (
                ARRAY[
                    (\'created\'::character varying)::text,
                    (\'ondevelopment\'::character varying)::text,
                    (\'draft\'::character varying)::text,
                    (\'reviewed\'::character varying)::text,
                    (\'published\'::character varying)::text,
                    (\'archived\'::character varying)::text
                ]
             ));'
        );
    }
};
