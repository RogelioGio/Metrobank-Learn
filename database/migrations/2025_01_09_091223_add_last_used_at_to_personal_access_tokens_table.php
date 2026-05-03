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
    if (Schema::hasTable('personal_access_tokens') && !Schema::hasColumn('personal_access_tokens', 'last_used_at')) {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->timestamp('last_used_at')->nullable();
        });
    }
}


    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::table('personal_access_tokens', function (Blueprint $table) {
        $table->dropColumn('last_used_at');
    });
}
};
