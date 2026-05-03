<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\FilterOption;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FilterOptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'filter_category_id' => 'required|exists:filter_categories,id',
            'value' => 'required|string|unique:filter_options,value',
            'label' => 'required|string|max:255',
            'checked' => 'boolean',
        ]);

        // Return validation errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create a new filter option
        $option = FilterOption::create([
            'filter_category_id' => $request->filter_category_id,
            'value' => $request->value,
            'label' => $request->label,
            'checked' => $request->checked ?? false,
        ]);

        Log::info('New Filter Option Added:', $option->toArray());

        return response()->json([
            'message' => 'Filter option added successfully',
            'option' => $option
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
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
