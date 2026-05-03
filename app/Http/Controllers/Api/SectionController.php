<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Models\Section;
use App\Http\Requests\StoreSectionRequest;
use App\Http\Requests\UpdateSectionRequest;
use App\Jobs\ResetOptionCache;
use Illuminate\Support\Facades\Gate;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Section::query()->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSectionRequest $request)
    {
        $validated = $request->validated();
        ResetOptionCache::dispatch();
        return Section::create($validated);
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Section::create(['section_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Sections" => $test
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        return $section;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSectionRequest $request, Section $section)
    {
        $validated = $request->validated();
        $section->update($validated);
        return $section;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        Gate::authorize('delete', Section::class);
        $section->delete();
        return response()->json([
            "Message" => "Section Deleted"
        ]);
    }
}
