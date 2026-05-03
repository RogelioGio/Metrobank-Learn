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
        Schema::create('user__test__attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('userInfo', 'id')->cascadeOnDelete();
            $table->foreignId('test_id')->constrained('tests', 'id')->cascadeOnDelete();
            $table->integer('score')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::table('learner_progress', function(Blueprint $table){
            $table->dropConstrainedForeignId('test_id');
        });

        Schema::table('question_user_info', function (Blueprint $table){
            $table->foreignId('attempt_id')->nullable()->constrained('user__test__attempts', 'id')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::dropIfExists('user__test__attempts');
        Schema::table('learner_progress', function(Blueprint $table){
            $table->foreignId('test_id')->nullable()->constrained('tests', 'id')->cascadeOnDelete();
            // $table->integer('score');
        });
        // Schema::table('question_user_info', function (Blueprint $table){
        //     $table->foreignId('user_id')->constrained('userInfo', 'id')->cascadeOnDelete();
        //     $table->dropForeign('attempt_id');
        //     $table->dropColumn('attempt_id');
        // });
    }
};
