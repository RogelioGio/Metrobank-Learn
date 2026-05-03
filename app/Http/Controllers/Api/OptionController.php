<?php

namespace App\Http\Controllers\Api;

use App\helpers\OptionCacheHelper;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CareerLevel;
use App\Models\Category;
use App\Models\City;
use App\Models\Department;
use App\Models\Division;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Section;
use App\Models\Title;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OptionController extends Controller
{
    public function index(){
        $divisions = Division::with('departments.titles.user', 'departments.titles.careerLevel')->get();
        $divisions->each(function ($division) {
            $division->departments->each(function ($department) use ($division) {
                $department->titles->each(function ($title) use ($division) {
                    $title->division_id = $division->id;
                });
            });
        });
        $options = [
            'cities' => City::all(),
            'divisions' => $divisions,
            'location' => Branch::all(),
            'roles' => Role::with(['permissions'])->orderBy('id', 'asc')->get(),
            'permission' => Permission::query()->whereNot('permission_name', 'Root')->get(),
            'career_level' => CareerLevel::all()
        ];

        return response()->json($options);
    }

    public function indexDepartmentDivisionTitles() {
        $departments = Department::with('division', 'titles.user', 'titles.careerLevel')->get();
        return response()->json($departments);
    }

    public function indexAuthoringOptions() {
        $options = [
            'categories' => Category::all(),
            'department' => Department::with('division', 'titles.user', 'titles.careerLevel')->get(),
            'career_level' => CareerLevel::all()
        ];

        return response()->json($options);
    }

    public function toRestore () {
        $options = [
            'cities' => City::where('archived', false)->get(),
            'divisions' => Division::with('departments.titles.user', 'departments.titles.careerLevel')->where('archived', true)->get(),

        ];
    }
}


