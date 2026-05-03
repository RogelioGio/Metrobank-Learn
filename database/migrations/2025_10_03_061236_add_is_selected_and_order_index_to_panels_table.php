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
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->boolean('is_selected')->default(0);
            $table->unsignedInteger('order_index')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carousel_images', function (Blueprint $table) {
                        $table->dropColumn(['is_selected', 'order_index']);

        });
    }
};
