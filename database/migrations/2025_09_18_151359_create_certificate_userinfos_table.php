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
        Schema::create('certificate_userinfos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('userInfo', 'id')->cascadeOnDelete();
            $table->foreignId('certificate_id')->nullable()->constrained('certificates', 'id');
            $table->dateTime('date_finished')->nullable();
            $table->string('outside_certificate_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_userinfos');
    }
};
