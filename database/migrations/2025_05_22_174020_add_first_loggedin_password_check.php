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
        Schema::table('userCredentials', function(Blueprint $table){
            $table->boolean('first_log_in')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('userCredentials', function(Blueprint $table){
            $table->dropColumn('first_log_in');
        });
    }
};
