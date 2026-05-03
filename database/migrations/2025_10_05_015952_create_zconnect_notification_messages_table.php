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
        Schema::create('zconnect_notification_messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_info_id')->nullable()->constrained('userInfo')->onDelete('set null');

            $table->unsignedBigInteger('course_id')->nullable();

            $table->string('CourseName')->nullable();
            $table->string('AssignerName')->nullable();
            $table->text('Message');

            $table->timestamp('ReadAt')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_notification_messages');
    }
};
