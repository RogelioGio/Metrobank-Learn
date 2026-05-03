<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zconnect_course_to_be_review', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('user_info_id');

            // Additional fields
            $table->boolean('approved')->default(false);
            $table->string('feedback')->nullable();

            $table->timestamps();

            // Constraints
            $table->foreign('course_id')
                ->references('id')->on('zconnect_created_courses')
                ->onDelete('cascade');

            $table->foreign('user_info_id')
                ->references('id')->on('userInfo')
                ->onDelete('cascade');

            // Optional: prevent duplicate assignments
            $table->unique(['course_id', 'user_info_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_viewers');
    }
};
