<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('titles', function (Blueprint $table) {
            // Drop old FK first (if exists)
            if (Schema::hasColumn('titles', 'division_id')) {
                $table->dropForeign(['division_id']);
                $table->dropColumn('division_id');
            }

            // Add new department_id column
            $table->unsignedBigInteger('department_id')->nullable();

            // Add FK to departments
            $table->foreign('department_id')
                  ->references('id')
                  ->on('departments')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('titles', function (Blueprint $table) {
            // Drop new FK and column
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');

            // Restore division_id column
            $table->unsignedBigInteger('division_id')->nullable();
            $table->foreign('division_id')
                  ->references('id')
                  ->on('divisions')
                  ->nullOnDelete();
        });
    }
};
