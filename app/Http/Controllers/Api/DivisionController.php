<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Models\Division;
use App\Http\Requests\StoreDivisionRequest;
use App\Http\Requests\UpdateDivisionRequest;
use App\Jobs\ResetOptionCache;
use App\Services\UserLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DivisionController extends Controller
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

        return Division::query()->where('archived', $archived)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDivisionRequest $request, UserLogService $log,)
    {
        $validated = $request->validated();
        ResetOptionCache::dispatch();
        $validated = $request->validated();
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['division_name'],
            $request->ip(),
        );
        return Division::create($validated);
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Division::create(['division_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Divisions" => $test
        ]);
    }

    public function bulk(Request $request){
        $request->validate([
            'department_id' => 'required',
            'divisions' => 'required|array',
            'divisions.*.name' => 'required|string|distinct'
        ]);

        $department_id = $request->department_id;
        $divisions = $request->divisions;

        $inserted = [];
        foreach($divisions as $divs){
            $inserted[] = Division::create([
                'division_name' => $divs['name'],
                'department_id' => $department_id
            ]);
        }

        return response()->json([
            'department' => $department_id,
            'inserted' => $inserted
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Division $division)
    {
        return $division;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDivisionRequest $request, Division $division)
    {
        $validated = $request->validated();
        $division->update($validated);
        return $division;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Division $division, Request $request, UserLogService $log)
    {
        $name = $division->division_name;
        $division->delete();
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'RemoveFormInput',
            $adder->fullName().' has removed '.$name,
            $request->ip(),
        );
        return response()->json([
            'meesage' => 'Division Deleted'
        ]);
    }

    //getDivision by id
    public function findDivisionbyId($id){
        $division = Division::find($id);
        return response()->json($division);
    }

    public function add(Request $request, UserLogService $log)
    {
        $validated = $request->validate([
            'division_name' => 'required|string|unique:divisions,division_name'
        ]);
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['division_name'],
            $request->ip(),
        );

        return Division::create($validated);
    }
}
