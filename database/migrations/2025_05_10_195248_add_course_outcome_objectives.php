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
        Schema::table('courses', function(Blueprint $table){
            $table->text("course_outcomes")->nullable();
            $table->text("course_objectives")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function(Blueprint $table){
            $table->dropColumn("course_outcomes");
            $table->dropColumn("course_objectives");
        });
    }
};
