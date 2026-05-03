<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zconnect_course_to_be_review', function (Blueprint $table) {
            // Drop the old boolean column
            $table->dropColumn('approved');

            // Add new enum column
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('user_info_id');
        });
    }

    public function down(): void
    {
        Schema::table('course_viewers', function (Blueprint $table) {
            // Drop the enum column
            $table->dropColumn('approval_status');

            // Re-add the old boolean column
            $table->boolean('approved')->default(false)->after('user_info_id');
        });
    }
};
