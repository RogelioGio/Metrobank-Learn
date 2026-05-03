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
        Schema::create('zconnect_courses', function (Blueprint $table) {
        $table->id();

        $table->boolean('Status')->default(false);
        $table->boolean('IsMandatory')->default(false);
        $table->string('CourseName');
        $table->text('CourseDescription');
        $table->string('CourseType')->nullable();
        $table->text('CourseObjectives');
        $table->string('CreatorName');
        $table->integer('CreatorID'); 
        $table->string('ImagePath')->nullable();
        $table->string('CallingID', 11)->unique();

        // $table->foreignId('CategoryID')->references('id')->on('zconnect_categories')->onDelete('cascade');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_courses');
    }
};
