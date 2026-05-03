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
        Schema::table('learner_engagements', function (Blueprint $table) {
            $table->dropColumn('recorded_at');
            $table->date('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('date_learner_engagements', function (Blueprint $table) {
            $table->dropColumn('recorded_at');
            $table->timestamp('recorded_at');
        });
    }
};
