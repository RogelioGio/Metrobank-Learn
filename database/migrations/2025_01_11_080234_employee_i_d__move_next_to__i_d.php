<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // public function up(): void
    // {
    //     Schema::table('userinfo', function (Blueprint $table) {
    //       // Step 1: Remove the existing column
    //         $table->dropColumn('employeeID');
    //     });

    //     Schema::table('userinfo', function (Blueprint $table) {
    //         // Step 2: Recreate the column next to the `id` column
    //         $table->string('employeeID')->after('id')->nullable();
    //     });
    // }

    // /**
    //  * Reverse the migrations.
    //  */
    // public function down(): void
    // {
    //     Schema::table('userinfo', function (Blueprint $table) {
    //         // Remove the column (in case of rollback)
    //         $table->dropColumn('employeeID');
    //     });

    //     Schema::table('userinfo', function (Blueprint $table) {
    //         // Recreate the column (but without positioning since rollback doesn't allow `->after`)
    //         $table->string('employeeID')->nullable();
    //     });
    // }
};
