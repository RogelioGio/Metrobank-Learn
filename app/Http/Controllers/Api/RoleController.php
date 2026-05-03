<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRolePermissionRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Permission;
use App\Models\Role;
use App\Models\UserInfos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'roles' => Role::withCount('users')->orderBy('created_at', 'desc')->with('permissions')->get(),
            'permissions' => Permission::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create($request->all());
        ResetOptionCache::dispatch();
        return $role;
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Role::create(['role_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Roles" => $test
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return $role;
    }

    public function showRolePermissions(Role $role){
        return $role->permissions;
    }

    public function updateRolePermissions(UpdateRolePermissionRequest $request, Role $role){
        
        $bulk = collect($request->all())->map(function($arr, $key){
            $test = [];
            foreach($arr as $key => $value){
                $test = $value;
            }
            return $test;
        });

        $role->permissions()->sync($bulk);
        ResetOptionCache::dispatch();
        
        return response()->json([
            "message" => $role->load(['permissions'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreRoleRequest $request, Role $role)
    {
        $temp = $role->update($request->all());
        return $temp;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $role->delete();
    }
}
