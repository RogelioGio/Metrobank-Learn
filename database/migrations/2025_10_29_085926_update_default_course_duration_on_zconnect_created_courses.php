<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zconnect_created_courses', function (Blueprint $table) {
            $table->integer('CourseDuration')->default(0)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('zconnect_created_courses', function (Blueprint $table) {
            $table->integer('CourseDuration')->default(1440)->nullable()->change();
        });
    }
};
