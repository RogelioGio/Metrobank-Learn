<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Add device info (optional, but useful for tracking)
            $table->string('device_name')->nullable()->after('tokenable_id');
            $table->string('ip_address')->nullable()->after('device_name');
            $table->string('user_agent')->nullable()->after('ip_address');

            // Token management
            $table->string('refresh_token', 64)->nullable()->unique()->after('expires_at'); // store refresh token securely
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn([
                'device_name',
                'ip_address',
                'user_agent',
                'expires_at',
                'refresh_token',
            ]);
        });
    }
};
