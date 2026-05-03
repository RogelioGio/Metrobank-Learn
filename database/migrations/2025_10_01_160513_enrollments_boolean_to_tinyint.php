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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn('due_soon');
            $table->dropColumn('allow_late');
            $table->smallInteger('due_soon')->default(0);
            $table->smallInteger('allow_late')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn('due_soon');
            $table->dropColumn('allow_late');
            $table->boolean('due_soon')->default(false);
            $table->boolean('allow_late')->default(false);
        });
    }
};
