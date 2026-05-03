<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Drop default first
        DB::statement('ALTER TABLE user__test__attempts ALTER COLUMN is_completed DROP DEFAULT');

        // Convert boolean → smallint using explicit mapping
        DB::statement("
            ALTER TABLE user__test__attempts
            ALTER COLUMN is_completed
            TYPE SMALLINT
            USING CASE
                WHEN is_completed = true THEN 1
                ELSE 0
            END
        ");

        // Set new default
        DB::statement("ALTER TABLE user__test__attempts ALTER COLUMN is_completed SET DEFAULT 0");
    }

    public function down(): void
    {
        // Drop smallint default first
        DB::statement('ALTER TABLE user__test__attempts ALTER COLUMN is_completed DROP DEFAULT');

        // Convert smallint → boolean
        DB::statement("
            ALTER TABLE user__test__attempts
            ALTER COLUMN is_completed
            TYPE BOOLEAN
            USING CASE
                WHEN is_completed = 1 THEN true
                ELSE false
            END
        ");

        // Restore default
        DB::statement("ALTER TABLE user__test__attempts ALTER COLUMN is_completed SET DEFAULT false");
    }
};

