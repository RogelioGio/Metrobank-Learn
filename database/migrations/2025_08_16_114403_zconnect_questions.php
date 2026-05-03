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
        Schema::create('zconnect_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained('zconnect_tests')->onDelete('cascade');

            $table->integer('QuestionPoints');
            $table->string('QuestionText');
            $table->string('QuestionImage')->nullable();
            $table->string('QuestionYoutube')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_questions');
        
    }
};
