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
        Schema::create('zconnect_certificate_creditors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('course_id')->constrained('zconnect_created_courses')->onDelete('cascade');

            $table->string('CreditorName')->nullable();
            $table->string('CreditorPosition')->nullable();
            $table->string('SignatureURL_Path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_certificate_creditors');
    }
};
