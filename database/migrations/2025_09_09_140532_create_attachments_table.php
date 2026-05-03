<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->bigIncrements('id'); // BIGSERIAL PRIMARY KEY

            // File fields
            $table->string('FileName', 255)->nullable();
            $table->string('FilePath', 255)->nullable();

            // Video fields
            $table->string('VideoName', 255)->nullable();
            $table->string('VideoPath', 255)->nullable();

            // Timestamps
            $table->timestamps(); // created_at, updated_at

            // Relations
            $table->unsignedBigInteger('course_id')->nullable();

            // Extra fields
            $table->string('currentOrderPosition', 255)->nullable();
            $table->text('AttachmentDescription')->nullable();
            $table->string('AttachmentType', 255)->nullable();

            // Foreign key constraint (optional)
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')
                  ->onDelete('cascade'); // if course is deleted, remove attachments
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
