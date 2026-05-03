<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = ["Manila City", "Quezon City", "Makati City"];
        
        foreach($cities as $city){
            City::create(["city_name" => $city]);
        }
    }
}
