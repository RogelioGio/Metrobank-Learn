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
        Schema::table('zconnect_sme_permitted', function (Blueprint $table) {
            $table->foreign('PermissionsID')
                ->references('id')
                ->on('zconnect_sme_permissions')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_sme_permitted', function (Blueprint $table) {
            $table->dropForeign(['PermissionsID']);
        });
    }
};
