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
        Schema::table('userInfo', function (Blueprint $table) {
            $table->foreignId('division_id')->nullable()->constrained('divisions', 'id')->nullOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections', 'id')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('userInfo', function (Blueprint $table) {
            //
        });
    }
};
