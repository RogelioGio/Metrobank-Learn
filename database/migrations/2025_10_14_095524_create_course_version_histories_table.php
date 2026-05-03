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
        Schema::create('zconnect_course_version_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('CourseID')->constrained('zconnect_created_courses')->onDelete('cascade');
            $table->foreignId('UserInfoID')->constrained('userInfo');
            $table->string('Action');
            $table->json('Changes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_course_version_histories');
    }
};
