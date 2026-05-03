<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingModeRequest;
use App\Models\Training_Mode;
use Illuminate\Http\Request;

class Training_ModeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Training_Mode::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrainingModeRequest $request)
    {
        $training_mode = Training_Mode::create($request->all());
        return $training_mode;
    }

    /**
     * Display the specified resource.
     */
    public function show(Training_Mode $training_Mode)
    {
        return $training_Mode;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreTrainingModeRequest $request, Training_Mode $training_Mode)
    {
        $temp = $training_Mode->update($request->all());
        return $temp;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Training_Mode $training_Mode)
    {
        $training_Mode->delete();
        return response()->json([
            "Message" => "Training Mode deleted"
        ]);
    }
}
