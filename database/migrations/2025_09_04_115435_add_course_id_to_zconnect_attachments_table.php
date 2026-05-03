<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('zconnect_attachments', function (Blueprint $table) {
           $table->foreignId('course_id')->nullable()->constrained('zconnect_created_courses')->onDelete('cascade');
           $table->string('currentOrderPosition')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('zconnect_attachments', function (Blueprint $table) {
            $table->dropColumn('course_id');
            $table->dropColumn('currentOrderPosition');
        });
    }
};
