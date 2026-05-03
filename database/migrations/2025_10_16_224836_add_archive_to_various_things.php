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
        Schema::table('branches', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('career_levels', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('departments', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('certificate_userinfos', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('cities', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('divisions', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('permissions', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('titles', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->smallInteger('archived')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('career_levels', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('certificate_userinfos', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('cities', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('divisions', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('titles', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('archived');
        });
    }
};
