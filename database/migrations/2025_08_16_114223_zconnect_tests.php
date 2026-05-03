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
        Schema::create('zconnect_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('zconnect_courses')->onDelete('cascade');

            $table->integer('oldOrderPosition');
            $table->integer('currentOrderPosition');
            $table->string('TestName');
            $table->text('TestDescription')->nullable(); 
            $table->string('TestType')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_tests');
        
    }
};
