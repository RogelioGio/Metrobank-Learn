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
        Schema::table('zconnect_deleted_content', function (Blueprint $table) {
            $table->timestamp('DeletedAt')->nullable()->change();

            $table->timestamp('ArchivedAt')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_deleted_content', function (Blueprint $table) {
            $table->timestamp('DeletedAt')->nullable(false)->change();

            $table->dropColumn('ArchivedAt');
        });
    }
};
