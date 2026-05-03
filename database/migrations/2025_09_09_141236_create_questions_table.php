<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->bigIncrements('id'); // BIGSERIAL PRIMARY KEY

            $table->string('QuestionType', 255)->nullable();
            $table->json('BlockData'); // NOT NULL

            $table->unsignedBigInteger('AssessmentID'); // FK to tests

            $table->timestamps(); // created_at, updated_at

            // Foreign key to tests table
            $table->foreign('AssessmentID')
                  ->references('id')
                  ->on('tests')
                  ->onDelete('cascade'); // if test is deleted, its questions are removed
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
