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
        Schema::create('zconnect_deleted_courses_retention', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_info_id')->index();
            $table->integer('RetentionValue')->default(1);
            $table->enum('RetentionUnit', ['days', 'weeks', 'months'])->default('days');
            $table->timestamps();

            $table->foreign('user_info_id')->references('id')->on('userInfo')->onDelete('cascade');
            $table->unique('user_info_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_deleted_courses_retention');
    }
};
