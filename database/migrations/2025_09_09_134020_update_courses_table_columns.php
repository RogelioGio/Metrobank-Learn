<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // 🔴 Drop old columns
            $table->dropColumn([
                'name',
                'description',
                'type_id',
                'training_mode_id',
                'system_admin_id',
                'archived',
                'CourseID',
                'months',
                'days',
                'course_outcomes',
                'course_objectives',
                'published',
            ]);

            // 🟢 Add new columns
            $table->string('courseID')->unique();
            $table->string('courseName');
            $table->text('overview')->nullable();
            $table->text('objective')->nullable();

            // Foreign keys
            $table->unsignedBigInteger('career_level_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->change(); // reuse existing category
            $table->unsignedBigInteger('user_info_id')->nullable();

            // Image
            $table->string('image_path')->nullable();

            // Add foreign key constraints
            $table->foreign('career_level_id')->references('id')->on('career_levels')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('user_info_id')->references('id')->on('userInfo')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Rollback new columns
            $table->dropForeign(['career_level_id']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['user_info_id']);

            $table->dropColumn([
                'courseID',
                'courseName',
                'overview',
                'objective',
                'training_type',
                'career_level_id',
                'category_id',
                'user_info_id',
                'image_path',
            ]);

            // Restore old columns
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('type_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('training_mode_id')->nullable();
            $table->unsignedBigInteger('system_admin_id')->nullable();
            $table->boolean('archived')->default(false);
            $table->string('CourseID')->unique();
            $table->integer('months')->nullable();
            $table->integer('days')->nullable();
            $table->text('course_outcomes')->nullable();
            $table->text('course_objectives')->nullable();
            $table->boolean('published')->default(false);
        });
    }
};
