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
        Schema::table('question_user_info', function (Blueprint $table) {
            $table->dropColumn('correct');
            $table->smallInteger('correct')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_user_info', function (Blueprint $table) {
            $table->dropColumn('correct');
            $table->boolean('correct')->nullable()->default(null);
        });
    }
};
