<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SMEPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'FullAccess',
            'CompleteCourse',
            'ExportCourse',
            'ArchiveCourse',
            'DeleteCourse',
            'EditCourseDetails',
            'CreateItems',
            'EditItems',
            'DeleteItems',
            'AddSignature',
            'ShareAccess',
            'PermissionControl',
        ];

        $data = array_map(fn($permission) => ['name' => $permission], $permissions);

        DB::table('zconnect_sme_permissions')->insert($data);
    }
}
