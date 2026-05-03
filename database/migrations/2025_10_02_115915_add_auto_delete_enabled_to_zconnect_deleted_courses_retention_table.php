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
        Schema::table('zconnect_deleted_courses_retention', function (Blueprint $table) {
            $table->smallInteger('AutoDelete')->default(0)->after('RetentionUnit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('zconnect_deleted_courses_retention', function (Blueprint $table) {
            $table->dropColumn('AutoDelete');
        });
    }
};
