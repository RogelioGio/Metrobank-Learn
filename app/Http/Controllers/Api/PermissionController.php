<?php

namespace App\Http\Controllers\Api;

use App\helpers\OptionCacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
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

        return Permission::query()->where('archived', $archived)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePermissionRequest $request)
    {
        $permission = Permission::create($request->validated());
        ResetOptionCache::dispatch();
        return $permission;
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        return $permission;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $temp = $permission->update($request->validated());
        return $temp;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        $permission->delete();
    }

    public function bulkAdd(StorePermissionRequest $request){

        $permissions = collect($request->permissions)->map(function ($entry){
            return ['permission_name' => $entry];
        });
        Permission::insert($permissions->toArray());
        ResetOptionCache::dispatch();

        return response()->json(['message' => 'Permissions added successfully'], 201);
    }
}
