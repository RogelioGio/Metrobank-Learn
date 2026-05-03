<?php

namespace App\helpers;

use App\Models\Branch;
use App\Models\City;
use App\Models\Department;
use App\Models\Division;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Section;
use App\Models\Title;
use Illuminate\Support\Facades\Cache;

class OptionCacheHelper{
    public static function CacheOptions(){
        $options = Cache::rememberforever('options', function(){
                return [
                    'cities' => City::all(),
                    'departments' => Department::with('division.titles' )->get(),
                    'location' => Branch::all(),
                    'titles' => [],
                    'roles' => Role::all()->load('permissions'),
                    'permission' => Permission::query()->whereNot('permission_name', 'Root')->get(),
                    'division' => [],
                    'section' => [],
                ];
        });
        return $options;
    }
}

