<?php

namespace App\Http\Controllers\Api;

use App\Filters\BranchFilter;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\CityBranchRequest;
use App\Http\Requests\ManyBranchSwitchCityRequest;
use App\Models\Branch;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Jobs\ResetOptionCache;
use App\Models\City;
use App\Models\Department;
use App\Services\UserLogService;
use Illuminate\Support\Facades\Gate;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = new BranchFilter();
        $queryItems = $filter->transform($request);
        $archived = false;
        if(!empty($request['archived'])){
            if($request['archived'] === "true"){
                $archived = true;
            } else{
                $archived = false;
            }
        }

        if(count($queryItems) > 0){
            return Branch::where($queryItems)->where('archived', $archived)->orderBy('created_at', 'desc')->get();
        }
        return Branch::query()->where('archived', $archived)->orderBy('created_at', 'desc')->get();
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Branch::create(['branch_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Branches" => $test
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBranchRequest $request, UserLogService $log)
    {
        $validated = $request->validated();
        $city = City::find($validated['city_id']);
        $branch = Branch::create(["branch_name" => $validated['branch_name']]);
        $branch->city()->associate($city);
        $branch->save();
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['branch_name'],
            $request->ip(),
        );
        ResetOptionCache::dispatch();
        return $branch;
    }

    public function addCity(CityBranchRequest $request){
        $validated = $request->validated();
        $branch = Branch::create($validated['branch_name']);
        $city = City::find($validated['city_id']);
        $branch->city()->associate($city);
        $branch->save();
        return response()->json([
            "Message" => "City Attached",
            "Data" => $branch,
            "City" => $branch->city,
        ]);
    }

    public function bulkChangeCity(ManyBranchSwitchCityRequest $request, UserLogService $log){
        $validated = $request->validated();
        Branch::whereIn('id', array_column($validated['data'], 'id'))->update(['city_id', $validated['city_id']]);
        $branches = Branch::whereIn('id', array_column($validated['data'], 'id'))->pluck('branch_name')->toArray();
        $branchNames = implode(', ', $branches);
        $cityName = City::find($validated['city_id'], ['city_name']);

        $currentUser = $request->user()->userInfos;
        $log->log(
            $currentUser->id,
            "Change branch city",
            $currentUser->fullName()." has changed [$branchNames] to be in $cityName",
            $request->ip(),
        );

        return response()->json([
            "message" => "[$branchNames] has been added to $cityName",
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Branch $branch)
    {
        return $branch;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        $validated = $request->validated();
        $branch->update($validated);
        return $branch;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch, Request $request, UserLogService $log)
    {
        $name = $branch->branch_name;
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'RemoveFormInput',
            $adder->fullName().' has removed '.$name,
            $request->ip(),
        );
        $branch->delete();
        return response()->json([
            "message" => "Branch Deleted"
        ]);
    }


}
