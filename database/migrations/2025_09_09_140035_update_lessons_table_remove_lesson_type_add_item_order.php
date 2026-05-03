<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // Remove lesson_type
            $table->dropColumn('lesson_type');

            // Add item_order
            $table->integer('item_order')->nullable()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // Remove item_order
            $table->dropColumn('item_order');

            // Restore lesson_type
            $table->string('lesson_type')->nullable();
        });
    }
};
