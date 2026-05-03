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
        Schema::create('zconnect_categories', function (Blueprint $table) {
            $table->id();
            $table->string('CategoryName')->unique();
            $table->unsignedBigInteger('CreatorID');
            $table->string('CreatorName');
            $table->timestamps();
        });

        Schema::table('zconnect_courses', function (Blueprint $table){
            $table->foreignId('CategoryID')->references('id')->on('zconnect_categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_categories');
        
    }
};
