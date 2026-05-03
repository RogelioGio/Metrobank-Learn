<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('zconnect_user_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_info_id')->constrained('userInfo')->onDelete('cascade');

            $table->string('Action');
            $table->json('Details')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zconnect_user_reports');
    }
};
