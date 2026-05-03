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
        Schema::create('user_logs', function (Blueprint $table) {
            $table->id(); // id (primary key)
            $table->unsignedBigInteger('user_infos_id');
            $table->string('log_type'); // Log Type
            $table->text('log_description'); // Log Description
            $table->timestamp('log_timestamp')->useCurrent(); // Log Timestamp
            $table->ipAddress('ip_address'); // IP Address
            $table->timestamps(); // created_at & updated_at

            //Foriegn key
            $table->foreign('user_infos_id')
                ->references('id')
                ->on('userInfo')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_logs');
    }
};
