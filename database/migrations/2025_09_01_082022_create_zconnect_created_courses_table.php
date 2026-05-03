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
        Schema::create('zconnect_created_courses', function (Blueprint $table) {
            $table->id();

            // Course details
            $table->string('CourseID')->unique();
            $table->string('CourseName');
            $table->text('Overview')->nullable();
            $table->text('Objective')->nullable();
            $table->string('TrainingType');
            $table->enum('CourseStatus', ['created','ondeveleopment','draft', 'published', 'archived'])->default('created');

            // Foreign keys
            $table->unsignedBigInteger('division_id');
            $table->unsignedBigInteger('career_level_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('user_info_id');

            $table->foreign('division_id')->references('id')->on('divisions')->onDelete('cascade');
            $table->foreign('career_level_id')->references('id')->on('career_levels')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('user_info_id')->references('id')->on('userInfo')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_created_courses');
    }
};
