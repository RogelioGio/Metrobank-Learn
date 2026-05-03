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
    // If the table does not exist, skip this migration
    if (!Schema::hasTable('zconnect_deleted_creditors')) {
        return;
    }

    if (!Schema::hasColumn('zconnect_deleted_creditors', 'DeletedAt')) {
        Schema::table('zconnect_deleted_creditors', function (Blueprint $table) {
            $table->timestamp('DeletedAt')->nullable();
        });
    }
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_deleted_creditors', function (Blueprint $table) {
            $table->dropColumn('DeletedAt');
        });
    }
};
