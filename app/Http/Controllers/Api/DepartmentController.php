<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\ManyDepartmentSwitchDivisionRequest;
use App\Models\Department;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Branch;
use App\Models\Division;
use App\Services\UserLogService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $archived = false;
        if(!empty($request['archived'])){
            if($request['archived'] === "true"){
                $archived = true;
            } else{
                $archived = false;
            }
        }

        return Department::query()->where('archived', $archived)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartmentRequest $request, UserLogService $log,)
    {
        $validated = $request->validated();
        $department = Department::create($validated);
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['department_name'],
            $request->ip(),
        );
        ResetOptionCache::dispatch();
        return $department;
    }

    public function bulkStore(Request $request){
        // $bulk = $request->validated();
        // $test = [];
        // foreach($bulk as $index => $output){
        //     $test[] = Department::create(['department_name' => $output["forminputname"]]);
        // }
        // return response()->json([
        //     "Departments" => $test
        // ])
        //
        // ;
        foreach ($request->all() as $item){
            $inserted[] = Department::create(['department_name' => $item["department"]]);
        }

        return response()->json($inserted, 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        return $department;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        $validated = $request->validated();
        $department->update($validated);
        return $department;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department, Request $request, UserLogService $log)
    {
        $name = $department->division_name;
        $department->delete();
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'RemoveFormInput',
            $adder->fullName().' has removed '.$name,
            $request->ip(),
        );
        return response()->json([
            'meesage' => 'Department Deleted'
        ]);
    }

    public function getDivisionbyDepartment($id){
        if(empty($id)){
            $divisions = Division::all();
        } else {
            $divisions = Division::where('department_id', $id)->get();
        }
        return response()->json($divisions);
    }

    public function add(Request $request, UserLogService $log){
        $validated = $request->validate([
            'department_name' => 'required|string|unique:departments,department_name',
            'division_id' => 'required|integer|exists:divisions,id'
        ]);

        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['department_name'],
            $request->ip(),
        );

        $department = Department::create([
            'department_name' => $request->department_name,
            'division_id' => $request->division_id
        ]);

        return response()->json($department, 201);
    }

    public function bulkChangeDivision(ManyDepartmentSwitchDivisionRequest $request, UserLogService $log){
        $validated = $request->validated();
        Department::whereIn('id', array_column($validated['data'], 'id'))->update(['division_id', $validated['division_id']]);
        $departments = Department::whereIn('id', array_column($validated['data'], 'id'))->pluck('department_name')->toArray();
        $departmentNames = implode(', ', $departments);
        $divisionName = Division::find($validated['division_id'], ['division_name']);
        
        $currentUser = $request->user()->userInfos;
        $log->log(
            $currentUser->id,
            "Change department division",
            $currentUser->fullName()." has changed [$departmentNames] to be in $divisionName",
            $request->ip(),
        );

        return response()->json([
            "message" => "[$departmentNames] has been added to $divisionName",
        ]);
    }
}
