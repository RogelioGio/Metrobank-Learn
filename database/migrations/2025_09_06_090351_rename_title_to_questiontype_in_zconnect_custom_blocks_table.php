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
        Schema::table('zconnect_custom_blocks', function (Blueprint $table) {
            $table->dropForeign(['test_id']);

            $table->renameColumn('title', 'QuestionType');
            $table->renameColumn('block_data', 'BlockData');
            $table->renameColumn('test_id', 'AssessmentID');

            $table->foreign('AssessmentID')
                ->references('id')
                ->on('zconnect_tests')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zconnect_custom_blocks', function (Blueprint $table) {
            $table->dropForeign(['AssessmentID']);

            $table->renameColumn('QuestionType', 'title');
            $table->renameColumn('BlockData', 'block_data');
            $table->renameColumn('AssessmentID', 'test_id');

            $table->foreign('test_id')
                ->references('id')
                ->on('zconnect_tests')
                ->onDelete('cascade');
        });
    }
};
