<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\CareerLevel;
use Illuminate\Http\Request;

class CareerLevelController extends Controller
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

        $careerLevels = CareerLevel::where('archived', $archived)->get();
        return response()->json($careerLevels);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'careerLevel' => 'required|string|max:255|unique:career_levels,name',
            'careerRank' => 'required|integer|unique:career_levels,rank'
        ]);

        $careerLevel = CareerLevel::create([
            'rank' => $request->careerRank,
            'name' => $request->careerLevel
        ]);

        return response()->json($careerLevel, 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
