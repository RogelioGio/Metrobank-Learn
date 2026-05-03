<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // In PostgreSQL we must explicitly allow null by dropping NOT NULL
        DB::statement('ALTER TABLE questions ALTER COLUMN "BlockData" DROP NOT NULL');
    }

    public function down(): void
    {
        // Rollback: make BlockData JSON NOT NULL again
        DB::statement('ALTER TABLE questions ALTER COLUMN "BlockData" SET NOT NULL');
    }
};

