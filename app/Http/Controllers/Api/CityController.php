<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Models\City;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Jobs\ResetOptionCache;
use App\Services\UserLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CityController extends Controller
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

        return City::query()->where('archived', $archived)->orderBy('created_at', 'desc')->get();
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCityRequest $request, UserLogService $log,)
    {
        $validated = $request->validated();
        $city = City::create($validated);
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'AddFormInput',
            $adder->fullName().' has added '.$validated['city_name'],
            $request->ip(),
        );
        ResetOptionCache::dispatch();
        return $city;
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = City::create(['city_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Cities" => $test
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(City $city)
    {
        return $city;
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCityRequest $request, City $city)
    {
        $validatedData = $request->validated();
        $city->update($validatedData);
        return $city;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city, Request $request, UserLogService $log)
    {
        $name = $city->city_name;
        $adder = $request->user()->userInfos;
        $log->log(
            $adder->id,
            'RemoveFormInput',
            $adder->fullName().' has removed '.$name,
            $request->ip(),
        );
        $city->delete();
        return response()->json([
            "message" => "City Deleted"
        ]);
    }
}
