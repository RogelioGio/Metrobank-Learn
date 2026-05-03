<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\ManyTitleSwitchDepartmentRequest;
use App\Models\Title;
use App\Http\Requests\StoreTitleRequest;
use App\Http\Requests\UpdateTitleRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Department;
use App\Services\UserLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TitleController extends Controller
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

        return Title::query()->where('archived',$archived)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTitleRequest $request)
    {
        $title = Title::create($request->validated());
        ResetOptionCache::dispatch();
        return $title;
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Title::create(['title_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Titles" => $test
        ]);
    }

    public function bulk(Request $request){
        $request->validate([
            'division_id' => 'required',
            'career_level_id' => 'required',
            'titles' => 'required|array',
            'titles.*.name' => 'required|string|distinct'
        ]);

        $division_id = $request->division_id;
        $career_level_id = $request->career_level_id;
        $titles = $request->titles;

        $inserted = [];
        foreach($titles as $title){
            $inserted[] = Title::create([
                'title_name' => $title['name'],
                'division_id' => $division_id,
                'career_level_id' => $career_level_id
            ]);
        };
        return response()->json([
            'division' => $division_id,
            'career_level' => $career_level_id,
            'inserted' => $inserted
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Title $title)
    {
        return $title;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTitleRequest $request, Title $title)
    {
        $validated = $request->validated();
        $title->update($validated);
        return $title;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Title $title, Request $request, UserLogService $log)
    {
        $name = $title->title_name;
        $title->delete();
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'RemmoveFormInput',
            $adder->fullName().' has removed '.$name,
            $request->ip(),
        );
        return response()->json([
            'message' => 'title removed'
        ]);
    }

    public function add(Request $request, UserLogService $log)
    {
        $validated = $request->validate([
            'title_name' => 'required|string|unique:titles,title_name',
            'department_id' => 'required|integer|exists:departments,id',
            'career_level_id' => 'required|integer|exists:career_levels,id'
        ]);
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['title_name'],
            $request->ip(),
        );
        $title = Title::create($validated);

        return response()->json($title, 201);
    }

    public function bulkChangeDepartment(ManyTitleSwitchDepartmentRequest $request, UserLogService $log){
        $validated = $request->validated();
        Title::whereIn('id', array_column($validated['data'], 'id'))->update(['department_id', $validated['department_id']]);
        $titles = Title::whereIn('id', array_column($validated['data'], 'id'))->pluck('title_name')->toArray();
        $titleNames = implode(', ', $titles);
        $departmentName = Department::find($validated['department_id'], ['department_name']);

        $currentUser = $request->user()->userInfos;
        $log->log(
            $currentUser->id,
            "Change title department",
            $currentUser->fullName()." has changed [$titleNames] to be in $departmentName",
            $request->ip(),
        );

        return response()->json([
            'message' => "[$titleNames] has been added to $departmentName" 
        ]);
    }

}
