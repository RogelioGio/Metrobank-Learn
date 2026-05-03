<?php

namespace App\Http\Controllers\Api;

use App\Events\UserPermissionsChange;
use App\Events\UserRoleChange;
use App\Http\Controllers\Controller;
use App\Http\Requests\addUserCredential_request;
use App\Http\Requests\ChangeUserPasswordRequest;
use App\Http\Requests\ChangeUserPermissionsRequest;
use App\Http\Requests\StorePhoneNumberRequest;
use App\Http\Requests\updateUserCreds_info;
use App\Http\Requests\UserCredsSearchRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\UserCredentialsResource;
use App\Models\Role;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Notifications\AccountChangeNotification;
use App\Services\UserLogService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class userCredentials_controller extends Controller
{
    public function addUserCredentials(addUserCredential_request $request){

        $validatedData = $request->validated();

        //Check if the employeeID exists in the userInfos table
        $userInfo = UserInfos::where('employeeID', $validatedData['employeeID'])->first();
        if (!$userInfo) {
            return response()->json([
                'message' => 'User Info not found for employeeID: ' . $validatedData['employeeID']
            ], 404);
        }


        $userCredentials = UserCredentials::create([
            'MBemail' => $validatedData['MBemail'],
            'password' => $validatedData['password'],// Hash the password
            'user_info_id' => $userInfo->id
        ]);


        return response()->json([
            'message' => 'User Credentials Added Successfully',
            'data' => $userCredentials],201);
    }

    //update user credentials in the user maintenance management
    // public function updateUserCredentials(UserCredentials $userCredentials,updateUserCreds_info $request){
    //     $validatedData = $request->validated();

    //     $userCredentials->update([
    //         'password' => bcrypt($validatedData['password']),
    //         'MBemail' => $validatedData['MBemail']
    //     ]);

    //     return response()->json([
    //         'message' => 'User Credentials Updated Successfully',
    //         'data' => $userCredentials
    //     ]);
    // }

    public function updateUserCredentials(UserCredentials $userCredentials, ChangeUserPermissionsRequest $request, UserLogService $log){
        $validated = $request->validated();
        $adder = Auth::user()->userInfos;
        $old = $userCredentials->only('MBemail', 'password');
        if(empty($validated['password'])){
            unset($validated['password']);
            $userCredentials->update($validated);
        } else{
            $validated['first_log_in'] = true;
            $userCredentials->update($validated);
        }
        $userCredentials->refresh();
        $new = $userCredentials->only('MBemail', 'password');

        $changes = [];
        foreach($new as $field => $value){
            if($old[$field] !== $value){
                if($field === 'password'){
                    $changes[$field] = 'updated';
                } else{
                    $changes[$field] = $value;
                }
            }
        }
        $oldRole = $userCredentials->userInfos->roles()->first()->role_name;
        $userCredentials->userInfos->roles()->sync($validated['role_id']);
        $userCredentials->userInfos->load('roles');

        $bulk = collect($validated['permissions'])->pluck('permission_Id');
        $userCredentials->userInfos->permissions()->sync($bulk);
        $userCredentials->userInfos->load('permissions', 'roles');
        $newRole = $userCredentials->userInfos->roles()->first()->role_name;

        if(!($oldRole === $newRole)){
            $changes['role'] = $newRole;
        }

        $userCredentials->notify(new AccountChangeNotification($changes, $adder));
        $log->log($adder->id, 'Update user info', $adder->fullName().'has updated '.$userCredentials->userInfos->fullName().' user credentials', $request->ip());


        return response()->json([
            'message' => 'User Edited',
            'user' => $userCredentials->load(['userInfos.permissions', 'userInfos.roles']),
        ]);
    }

    public function StorePhoneNumber(UserCredentials $userCredentials, StorePhoneNumberRequest $request, UserLogService $log){
        $validated = $request->validated();
        $userCredentials->update(['phone_number' => $validated['phone_number']]);

        return response()->json([
            'message' => 'Phone number saved.'
        ]);
    }

    public function resetUserPassword(UserCredentials $userCredentials){
        $userInfo = $userCredentials->userInfos;
        $userCredentials->update([
            'password' => (preg_replace('/\s+/', '', $userInfo->first_name)."_".$userInfo->employeeID),
            'first_log_in' => false
        ]);

        return response()->json([
            'message' => 'User Password Updated Successfully',
            'data' => $userCredentials
        ]);
    }

    public function changePassword(UserCredentials $userCredentials, ChangeUserPasswordRequest $request ){
        $validated = $request->validated();

        if(!$userCredentials){
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $userCredentials->update([
            'password' => $validated['password'],
            'first_log_in' => false
        ]);

        // $userCredentials->tokens()->delete();

        return response()->json([
            'message' => 'Password has been changed',
            'user' => $userCredentials->makeVisible('phone_number')
        ], 200);
    }

    //User Credential List
    public function userCredentialsList(Request $request){

        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page
        $currentUserId = $request->user()->id;
        $count = 0;
        $query = UserCredentials::with(['userInfos', 'userInfos.roles', 'userInfos.city', 'userInfos.branch', 'userInfos.title.department.division','userInfos.permissions', 'userInfos.title.careerLevel'])
        ->orderBy('created_at', 'desc')
        ->whereHas('userInfos', function ($subQuery) {
            $subQuery->where('status', 'Active')
            ->whereNot(function (Builder $query){
                $query->whereHas('permissions', function(Builder $q) {
                    $q->where('permission_name', 'Root');
                });
            });
        })
        ->whereNot(function ($query) use ($currentUserId){
            $query->where('id', $currentUserId);
        });

        if ($request->has('department_id')) {
            if(!($request->input('department_id')['eq'] == "")){
                $query->whereHas('userInfos', function ($subQuery) use ($request) {
                    $subQuery->where('department_id', $request->input('department_id'));
                });
            }
        }

        if ($request->has('branch_id')) {
            if(!($request->input('branch_id')['eq'] == "")){
                $query->whereHas('userInfos', function ($subQuery) use ($request) {
                    $subQuery->where('branch_id', $request->input('branch_id'));
                });
            }
        }

        if ($request->has('role_id')){
            if(!($request->input('role_id')['eq'] == "")){
                $query->whereHas('roles', function($subQuery) use ($request){
                    $subQuery->where('role_id', $request->input('role_id'));
                });
            }
        }

        // Paginate the filtered results
        $userCredentials = UserCredentialsResource::collection($query->orderBy('created_at', 'desc')->paginate($perPage));

        return response()->json([
            'total' => $userCredentials->total(),
            'lastPage' => $userCredentials->lastPage(),
            'currentPage' => $userCredentials->currentPage(),
            'data' => $userCredentials->items()
        ]);

    }
    public function UnuserCredentialsList(Request $request){

        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page
        $currentUserId = $request->user()->userInfos->id;
        $query = UserCredentials::whereHas('userInfos', function ($subQuery) {
            $subQuery->where('status', 'Inactive');
        })
        ->with(['userInfos', 'userInfos.roles', 'userInfos.city', 'userInfos.branch', 'userInfos.department', 'userInfos.section', 'userInfos.division', 'userInfos.title','userInfos.permissions'])
        ->whereNot(function ($query) use ($currentUserId){
            $query->where('id', $currentUserId);
        })
        ->orderBy('created_at', 'desc');

        // Paginate the filtered results
        $userCredentials = $query->paginate($perPage);

        return response()->json([
            'total' => $userCredentials->total(),
            'lastPage' => $userCredentials->lastPage(),
            'currentPage' => $userCredentials->currentPage(),
            'data' => $userCredentials->items()
        ]);

    }

    public function UserCredsSearch(UserCredsSearchRequest $request){
        $search = $request['search'];
        $perPage = $request->input('perPage', 5); //Number of entry per page
        $page = $request->input('page', 1);//Default page
        $status = $request['status'] ?? 'Active';
        $result = UserCredentials::search($search);

        $result = $result->whereHas('userInfos', function ($query) use ($status) {
            $query->where('status', $status)->with(['userInfos', 'userInfos.roles', 'userInfos.city', 'userInfos.branch',
        'userInfos.department', 'userInfos.division', 'userInfos.title']);
        })->paginate($perPage);

        return response()->json([
            'total' => $result->total(),
            'lastPage' => $result->lastPage(),
            'currentPage' => $result->currentPage(),
            'data' => $result->items()
        ]);

    }

    public function findUser_Creds(UserCredentials $userCredentials){
        return $userCredentials->load(['userInfos', 'userInfos.roles', 'userInfos.city', 'userInfos.branch',
        'userInfos.department','userInfos.division', 'userInfos.title','userInfos.permissions']);
    }

    //find by employeeID in the user maintenance management
    public function findUser_EmployeeID($employeeID){
        $userinfo = UserInfos::where('employeeID', $employeeID)->first();

        $userCredentials = $userinfo->userCredentials;
        if($userCredentials){
            return response()->json([
                'message' => 'User Credentials Found',
                'data' => $userCredentials
            ]);
        }else{
            return response()->json([
                'message' => 'User Credentials Not Found'
            ],404);
        }
    }

    public function restoreUser(UserCredentials $userCredentials)
    {
        if($userCredentials){
            $userCredentials->userInfos->update(['status' => "Active"]);
            $userCredentials->save();
            return response()->json(['message' => 'User restored', 'user' => $userCredentials], 200);
        }else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }

    public function resetUsers()
    {
        // Truncate the users table
        DB::table('userCredentials')->truncate();

        return response()->json([
            'message' => 'Users table truncated and auto-increment reset.'
        ]);
    }

    //Delete User
    public function deleteUser(UserCredentials $userCredentials)
    {
        $userCredentials->userInfos->status = "Inactive";
        $userCredentials->userInfos->save();
        return response()->json([
            'message' => 'User is now set to inactive'
        ]);
    }

    public function updateOnlyPermissions(UserCredentials $userCredentials, Request $request)
    {
    $adder = Auth::user()->userInfos->first_name;
    $affected = $userCredentials->userInfos->first_name;

    // Validate that permissions is an array of integers
    $validated = $request->validate([
        'permissions' => 'required|array',
        'permissions.*' => 'integer|exists:permissions,id'
    ]);

    $userCredentials->userInfos->permissions()->sync($validated['permissions']);

    // Dispatch event (optional)
    UserPermissionsChange::dispatch($adder, $affected);

    return response()->json([
        'message' => 'Permissions successfully updated.',
        'user' => $userCredentials->load(['userInfos.permissions']),
    ]);
    }

    public function updateTest($userCredentialsId, ChangeUserPermissionsRequest $request) {
        $user = UserCredentials::with('userInfos', 'userInfos.roles','userInfos.permissions')->findOrFail($userCredentialsId)->userInfos;
        if (!$user) {
            return response()->json(['message' => 'UserInfo not found for this user.'], 404);
        }


        if($request->has('role')){
            $user->roles()->sync([$request->input('role')]);
            $user->load('roles');
        }

        if($request->has('permissions')){
            $permissionIds = collect($request->input('permissions'))
                ->pluck('permissionId')
                ->toArray();
            $user->permissions()->sync($permissionIds);
            $user->load('permissions');
        }

        return response() -> json([
            'message' => "The user and role updated",
            'User' => $user,
        ]);
    }

    public function searchUserCredentials(Request $request){
        $searchTerm = $request->input('q');
        $per_page = $request->input('perPage', 5);
        $currentUserId = $request->user()->id;


        $results = UserCredentials::query()
        ->with(['userInfos.title', 'userInfos.title.department.division', 'userInfos.branch', 'userInfos.branch.city', 'userInfos.career_level', 'userInfos.roles', 'userInfos.permissions'])
        ->whereHas('userInfos', function ($q) {
            $q->where('status', 'Active');
        })
        ->where('id', '!=', $currentUserId)
        ->where(function ($q) use ($searchTerm) {
            if ($searchTerm) {
                $q->where('MBemail', 'ILIKE', "%{$searchTerm}%")
                ->orWhereHas('userInfos', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'ILIKE', "%{$searchTerm}%")
                    ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                    ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                    ->orWhereHas('title', fn($q) => $q->where('title_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('career_level', fn($q) => $q->where('name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title.department.division', fn($q) => $q->where('division_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title.department', fn($q) => $q->where('department_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('branch', fn($q) => $q->where('branch_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('branch.city', fn($q) => $q->where('city_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('roles', fn($q) => $q->where('role_name', 'ILIKE', "%{$searchTerm}%"));
                });
            }
        })->paginate($per_page);

        return response()->json([
        'currentPage' => $results->currentPage(),
        'data' => $results->items(),
        'lastPage' => $results->lastPage(),
        'total' => $results->total(),
    ], 200);

    }

}
