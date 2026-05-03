<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->bigIncrements('id'); // BIGSERIAL PRIMARY KEY

            $table->integer('currentOrderPosition'); // NOT NULL
            $table->string('TestName', 255); // NOT NULL
            $table->text('TestDescription')->nullable();
            $table->string('TestType', 255)->nullable();

            $table->timestamps(); // created_at, updated_at

            // Foreign key
            $table->unsignedBigInteger('course_id')->nullable();
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')
                  ->onDelete('cascade'); // delete tests if course is deleted
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};
