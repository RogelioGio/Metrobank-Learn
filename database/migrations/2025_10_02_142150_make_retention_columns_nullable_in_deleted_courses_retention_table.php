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
        Schema::table('zconnect_deleted_courses_retention', function (Blueprint $table) {
            $table->integer('RetentionValue')->nullable()->change();
            $table->string('RetentionUnit')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_deleted_courses_retention', function (Blueprint $table) {
            $table->integer('RetentionValue')->nullable(false)->change();
            $table->string('RetentionUnit')->nullable(false)->change();
        });
    }
};
