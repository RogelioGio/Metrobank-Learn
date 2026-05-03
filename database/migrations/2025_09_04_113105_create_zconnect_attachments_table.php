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
        Schema::create('zconnect_attachments', function (Blueprint $table) {
            $table->id();

            $table->string('FileName')->nullable();
            $table->string('FilePath')->nullable();

            $table->string('VideoName')->nullable();
            $table->string('VideoPath')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_file_attachment');
    }
};
