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
        Schema::create('recently_opened_courses', function (Blueprint $table) {
            $table->bigIncrements('id'); // BIGSERIAL PRIMARY KEY
            $table->foreignId('user_info_id')->unique()->constrained('userInfo')->onDelete('cascade'); // BIGINT UNIQUE NOT NULL
            $table->foreignId('course_id')->unique()->constrained('courses')->onDelete('cascade'); // BIGINT UNIQUE NOT NULL
            $table->timestamp('last_opened_at')->nullable(); // TIMESTAMP
            $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recently_opened_courses');
    }
};
