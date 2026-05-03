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
        Schema::create('learner_recent_courses', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('userInfo_id');
            $table->unsignedBigInteger('course_id');

            $table->timestamp('last_opened_at')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('userInfo_id')
                ->references('id')
                ->on('userInfo')
                ->onDelete('cascade');

            $table->foreign('course_id')
                ->references('id')
                ->on('courses')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learner_recent_courses');
    }
};
