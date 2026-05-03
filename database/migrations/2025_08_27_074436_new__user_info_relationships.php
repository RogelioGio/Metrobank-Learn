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
        Schema::table('titles', function (Blueprint $table) {
            if (!Schema::hasColumn('titles', 'division_id')) {
                $table->unsignedBigInteger('division_id')->nullable();

                $table->foreign('division_id')
                    ->references('id')
                    ->on('divisions')
                    ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('titles', function(Blueprint $table){
            $table->dropForeign(['division_id']);
            $table->dropColumn('division_id');
        });
        Schema::table('divisions', function(Blueprint $table){
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });
    }
};
