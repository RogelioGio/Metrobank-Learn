<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\StoreTypeRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Type::query()->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTypeRequest $request)
    {
        $type = Type::create($request->validated());
        ResetOptionCache::dispatch();
        return $type;
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Type::create(['type_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Course Types" => $test
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Type $type)
    {
        return $type;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreTypeRequest $request, Type $type)
    {
        $temp = $type->update($request->validated());
        return $temp;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Type $type)
    {
        Gate::authorize('delete', Type::class);
        $type->delete();
        return response()->json([
            "Message" => "Type Deleted"
        ]);
    }
}
