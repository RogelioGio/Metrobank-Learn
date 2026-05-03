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
        Schema::create('zconnect_deleted_content', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('CourseID')->nullable();
            $table->unsignedBigInteger('LessonID')->nullable();
            $table->unsignedBigInteger('TestID')->nullable();
            $table->unsignedBigInteger('AttachmentID')->nullable();

            $table->timestamp('DeletedAt');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_deleted_content');
    }
};
