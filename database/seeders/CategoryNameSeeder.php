<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryNameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            ['category_name' => 'Orientation Training'],
            ['category_name' => 'Onboarding Training'],
            ['category_name' => 'Compliance Training'],
            ['category_name' => 'Product Training'],
            ['category_name' => 'Leadership Training'],
            ['category_name' => 'Technical Training'],
            ['category_name' => 'Quality Assurance Training'],
            ['category_name' => 'Soft-Skill Training'],
            ['category_name' => 'Team Training'],
            ['category_name' => 'Diversity Training'],
            ['category_name' => 'Safety Training'],
            ['category_name' => 'Upskilling'],
            ['category_name' => 'Reskilling']
        ]);
    }
}
