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
        Schema::create('zconnect_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('zconnect_courses')->onDelete('cascade');
            $table->string('CertificateName');
            $table->string('Grantee')->nullable();
            $table->date('AwardedDate')->nullable();
            $table->string('CertificatePath')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_certificates');

    }
};
