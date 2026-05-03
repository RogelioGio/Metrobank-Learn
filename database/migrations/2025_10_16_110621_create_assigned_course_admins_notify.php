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
        Schema::create('assigned_course_admins_notify', function (Blueprint $table) {
            $table->id();
            $table->foreignId('CourseAdminID')->constrained('userInfo')->onDelete('cascade');
            $table->foreignId('DistributorID')->constrained('userInfo')->onDelete('cascade');

            $table->foreignId("course_id")->constrained('courses')->onDelete('cascade');

            $table->string("CourseID");
            $table->timestamp("WillArchiveAt");
            $table->text("Reason");
            $table->smallInteger("IsRejected")->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assigned_course_admins_notify');
    }
};
