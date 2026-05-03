<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Drop foreign key first before dropping column
            $table->dropForeign(['author_id']);
            $table->dropColumn('author_id');

            // Drop weeks column
            $table->dropColumn('weeks');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Re-add weeks column
            $table->integer('weeks')->nullable();

            // Re-add author_id with foreign key
            $table->unsignedBigInteger('author_id')->nullable();
            $table->foreign('author_id')
                  ->references('id')
                  ->on('userInfo')
                  ->onDelete('set null');
        });
    }
};
