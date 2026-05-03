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
        Schema::create('zconnect_course_user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('zconnect_courses')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('userInfo')->onDelete('cascade');

            $table->boolean('can_edit_lessons')->default(false);
            $table->boolean('can_edit_tests')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_course_user_permissions');
        
    }
};
