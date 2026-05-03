<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE lessons ALTER COLUMN lesson_content_as_json TYPE JSON USING lesson_content_as_json::json');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE lessons ALTER COLUMN lesson_content_as_json TYPE TEXT USING lesson_content_as_json::text');
    }
};
