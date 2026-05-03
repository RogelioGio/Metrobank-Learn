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
        Schema::create('userInfo', function(Blueprint $table){
            $table->id();
            $table->string('employeeID',11)->unique();
            $table->string('first_name',30);
            $table->string('middle_name', 30)->nullable();
            $table->string('last_name', 30);
            $table->string('name_suffix', 5)->nullable();
            $table->string('department')->nullable();
            $table->string('title',100)->nullable();
            $table->string('branch')->nullable();
            $table->string('city')->index();
            $table->enum('status',['Active','Inactive'])->default('Active');
            $table->string('profile_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('userInfo');
    }

};
