<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Drop old column
            if (Schema::hasColumn('departments', 'department_id')) {
                $table->dropColumn('department_id');
            }

            // Add new column
            $table->unsignedBigInteger('division_id');

            // Add foreign key
            $table->foreign('division_id')
                  ->references('id')
                  ->on('divisions')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Drop the new FK and column
            $table->dropForeign(['division_id']);
            $table->dropColumn('division_id');

            // Restore old column
            $table->unsignedBigInteger('department_id');
        });
    }
};
