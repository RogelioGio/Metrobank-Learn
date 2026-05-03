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
        Schema::create('zconnect_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('zconnect_courses')->onDelete('cascade');
            
            $table->string('Sender');
            $table->string('Recipient')->nullable();
            $table->text('Comment');
            $table->string('MessageType')->default('Comment');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_comments');
        
    }
};
