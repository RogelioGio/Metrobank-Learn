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
        Schema::table('userInfo', function (Blueprint $table) {
            // Drop foreign keys first
            if (Schema::hasColumn('userInfo', 'department_id')) {
                $table->dropForeign(['department_id']);
            }
            if (Schema::hasColumn('userInfo', 'division_id')) {
                $table->dropForeign(['division_id']);
            }
            if (Schema::hasColumn('userInfo', 'section_id')) {
                $table->dropForeign(['section_id']);
            }
            if (Schema::hasColumn('userInfo', 'group_id')) {
                $table->dropForeign(['group_id']);
            }

            // Then drop the columns
            $table->dropColumn(['department_id', 'division_id', 'section_id', 'group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('userInfo', function (Blueprint $table) {
            // Add back the columns
            $table->unsignedBigInteger('department_id')->nullable()->after('user_credentials_id');
            $table->unsignedBigInteger('division_id')->nullable()->after('department_id');
            $table->unsignedBigInteger('section_id')->nullable()->after('division_id');
            $table->unsignedBigInteger('group_id')->nullable()->after('section_id');

            // Restore foreign keys
            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            $table->foreign('division_id')->references('id')->on('divisions')->nullOnDelete();
            $table->foreign('section_id')->references('id')->on('sections')->nullOnDelete();
            $table->foreign('group_id')->references('id')->on('subgroups')->nullOnDelete();
        });
    }
};
