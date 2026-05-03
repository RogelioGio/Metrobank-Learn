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
       if (Schema::hasTable('zconnect_deleted_courses')) {
        Schema::table('zconnect_deleted_courses', function (Blueprint $table) {
            if (!Schema::hasColumn('zconnect_deleted_courses', 'DeletedAt')) {
                $table->timestamp('DeletedAt')->nullable();
            }
        });
    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_deleted_courses', function (Blueprint $table) {
            $table->dropColumn('DeletedAt');
        });
    }
};
