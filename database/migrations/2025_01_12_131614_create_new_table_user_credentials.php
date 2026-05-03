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
        Schema::create('userCredentials', function (Blueprint $table) {
            $table->id();
            $table->string('MBemail',225);
            $table->string('password');
            $table->foreignId('user_info_id')->nullable()->constrained('userInfo', 'id')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('new_table_user_credentials');
    }
};
