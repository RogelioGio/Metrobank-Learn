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
        Schema::table('learner_progress', function (Blueprint $table) {
            $table->dropColumn('is_completed');
            $table->smallInteger('is_completed')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learner_progress', function (Blueprint $table) {
            $table->dropColumn('is_completed');
            $table->boolean('is_completed')->default(false);
        });
    }
};
