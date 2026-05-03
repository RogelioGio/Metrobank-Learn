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
        Schema::table('zconnect_tests', function (Blueprint $table) {
            $table->dropColumn('Trashed');
        });

        Schema::table('zconnect_tests', function (Blueprint $table) {
            $table->smallInteger('Trashed')->default(0)->notNull(); 
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_tests', function (Blueprint $table) {
            $table->dropColumn('Trashed');
        });

        Schema::table('zconnect_tests', function (Blueprint $table) {
            $table->boolean('Trashed')->default(false)->notNull();
        });
    }
};
