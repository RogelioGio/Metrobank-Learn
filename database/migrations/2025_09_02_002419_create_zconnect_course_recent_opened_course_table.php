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
        Schema::create('zconnect_course_recent_opened_course', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_info_id')->constrained('userInfo')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('zconnect_created_courses')->onDelete('cascade');
            $table->timestamp('last_opened_at')->nullable();
            $table->timestamps();

            $table->unique(['user_info_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_course_recent_opened_course');
    }
};
