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
        Schema::table('career_levels', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('departments', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('certificate_userinfos', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('cities', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('divisions', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('permissions', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('titles', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_levels', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('departments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('certificate_userinfos', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('cities', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('divisions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('titles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
