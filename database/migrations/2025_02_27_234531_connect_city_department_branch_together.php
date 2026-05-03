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
            $table->dropForeign(['department_id']);
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['city_id']);
            $table->dropColumn('department_id');
            $table->foreignId('department_id')->nullable()->constrained('departments', 'id')->nullOnDelete()->change();
            $table->dropColumn('branch_id');
            $table->dropColumn('city_id');
        });

        Schema::table('departments', function (Blueprint $table){
            $table->foreignId('branch_id')->nullable()->constrained('branches', 'id')->nullOnDelete();
        });

        Schema::table('branches', function(Blueprint $table){
            $table->foreignId('city_id')->nullable()->constrained('cities', 'id')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
