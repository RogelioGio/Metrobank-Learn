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
        Schema::create('permission_role', function(Blueprint $table){
            $table->id();
            $table->foreignId('permission_id')->nullable()->constrained('permissions', 'id')->cascadeOnDelete();
            $table->foreignId('role_id')->nullable()->constrained('roles', 'id')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_role');
    }
};
