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
            $table->dropColumn('department');
            $table->dropColumn('branch');
            $table->dropColumn('city');
            $table->foreignId('department_id')->nullable()->constrained('departments', 'id')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches', 'id')->cascadeOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('cities', 'id')->cascadeOnDelete();
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
