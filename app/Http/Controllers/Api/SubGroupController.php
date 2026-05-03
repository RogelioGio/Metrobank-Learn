<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subgroup;
use App\Http\Requests\StoreSubgroupRequest;
use App\Http\Requests\UpdateSubgroupRequest;
use Illuminate\Support\Facades\Gate;

class SubgroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Subgroup::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubgroupRequest $request)
    {
        $validated = $request->validated();
        $group = Subgroup::create($validated);
        return $group;
    }

    /**
     * Display the specified resource.
     */
    public function show(Subgroup $subgroup)
    {
        return $subgroup;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubgroupRequest $request, Subgroup $subgroup)
    {
        $validated = $request->validated();
        $subgroup->update($validated);
        return $subgroup;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subgroup $subgroup)
    {
        Gate::authorize('delete', Subgroup::class);
        $subgroup->delete();
        return response()->json([
            'message' => 'Subgroup Deleted'
        ]);
    }
}
