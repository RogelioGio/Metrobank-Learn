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
        Schema::create('zconnect_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('zconnect_courses')->onDelete('cascade');

            $table->integer('oldOrderPosition');
            $table->integer('currentOrderPosition');
            $table->string('LessonName');
            $table->string('LessonContent')->nullable();
            $table->json('LessonContentAsJSON')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_lessons');
        
    }
};
