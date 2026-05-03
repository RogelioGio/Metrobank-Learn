<?php

namespace App\Policies;

use App\Models\UserCredentials;
use App\Models\UserInfos;
use Illuminate\Auth\Access\Response;

class userInfosPolicy
{

    public function before(UserCredentials $userCredentials): bool|null{
        if($userCredentials->userInfos->status === "Active"){
            return null;
        }
        return false;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(UserCredentials $userCredentials): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(UserCredentials $userCredentials, UserInfos $userCredentialsInfos): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(UserCredentials $userCredentials): bool
    {
        $arrays = $userCredentials->permissions->toArray();
        $perm_names = [];
        foreach($arrays as $array){
            $perm_names[] = $array["permission_name"];
        }
        if(in_array("AddUserInfo", $perm_names)){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(UserCredentials $userCredentials): bool
    {
        $arrays = $userCredentials->permissions->toArray();
        $perm_names = [];
        foreach($arrays as $array){
            $perm_names[] = $array["permission_name"];
        }
        if(in_array('EditUserInfo', $perm_names)){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(UserCredentials $userCredentials): bool
    {
        $arrays = $userCredentials->permissions->toArray();

        $perm_names = [];
        foreach($arrays as $array){
            $perm_names[] = $array["permission_name"];
        }
        if(in_array('DeleteUserInfo', $perm_names)){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(UserCredentials $userCredentials, UserInfos $userCredentialsInfos): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(UserCredentials $userCredentials, UserInfos $userCredentialsInfos): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }
}
