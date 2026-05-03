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
        Schema::table('zconnect_attachments', function (Blueprint $table) {
            $table->text('AttachmentDescription')->nullable();
            $table->string('AttachmentType')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_attachments', function (Blueprint $table) {
            $table->dropColumn('AttachmentDescription');
            $table->dropColumn('AttachmentType');
        });
    }
};
