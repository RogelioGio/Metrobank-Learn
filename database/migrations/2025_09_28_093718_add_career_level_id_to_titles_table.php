<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('titles', function (Blueprint $table) {
            $table->foreignId('career_level_id')
                  ->after('department_id')
                  ->constrained('career_levels')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('titles', function (Blueprint $table) {
            $table->dropForeign(['career_level_id']);
            $table->dropColumn('career_level_id');
        });
    }
};
