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
        Schema::create('zconnect_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('zconnect_lessons')->onDelete('cascade');
            $table->enum('file_type', ['ppt', 'docx', 'mp4', 'mp3', 'pdf']);
            $table->string('file_path');
            $table->string('file_name');
            $table->timestamp('uploaded_at')->useCurrent(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_files');
        
    }
};
