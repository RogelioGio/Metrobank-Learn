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
        Schema::table('zconnect_sme_permitted', function (Blueprint $table) {
            $table->foreignId('course_id')->after('PermissionsID')->constrained('zconnect_created_courses')->onDelete('cascade');
            $table->foreignId('PermissionsID')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('zconnect_sme_permitted', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });
    }
};
