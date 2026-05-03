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
        Schema::table('zconnect_sme_permissions', function (Blueprint $table) {
            $table->renameColumn('CoursePermissions', 'name');

            $table->string('guard_name')->default('web')->after('name');
        });

        Schema::table('zconnect_sme_permissions', function (Blueprint $table) {
            $table->unique(['name', 'guard_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_sme_permissions', function (Blueprint $table) {
            $table->dropUnique(['name', 'guard_name']);
            $table->dropColumn('guard_name');

            $table->renameColumn('name', 'CoursePermissions');
        });
    }
};
