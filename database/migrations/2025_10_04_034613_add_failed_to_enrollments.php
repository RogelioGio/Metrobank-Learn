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
            $table->dropColumn('enrollment_status');
            $table->string('enrollment_status')->default('enrolled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->removeColumn('enrollment_status');
            $table->enum('enrollment_status', ['enrolled', 'ongoing', 'finished', 'late_finish', 'due-soon', 'past-due'])->default('enrolled');
        });
    }
};
