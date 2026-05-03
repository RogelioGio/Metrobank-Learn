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
        // Schema::create('zconnect_custom_answers', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('custom_question_id')->constrained('zconnect_custom_questions')->onDelete('cascade');
        //     $table->string('type');
        //     $table->text('content')->nullable();
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
