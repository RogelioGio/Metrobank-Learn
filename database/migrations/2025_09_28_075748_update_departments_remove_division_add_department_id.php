<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('divisions', function (Blueprint $table) {
            // Drop the foreign key if it exists
            $table->dropForeign(['department_id']);

            // Drop the department_id column itself
            $table->dropColumn('department_id');
        });
    }

    public function down(): void
    {
        Schema::table('divisions', function (Blueprint $table) {
            // Recreate the column
            $table->unsignedBigInteger('department_id')->nullable(false);

            // If you need to restore the foreign key, add it back
            // $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }
};
