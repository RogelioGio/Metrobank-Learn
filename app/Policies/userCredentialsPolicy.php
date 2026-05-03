<?php

namespace App\Policies;

use App\Models\UserCredentials;
use Illuminate\Auth\Access\Response;

class userCredentialsPolicy
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
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(UserCredentials $userCredentials, UserCredentials $userCredentialsCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        } elseif($userCredentialsCredentials->id === $userCredentials->id){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(UserCredentials $userCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(UserCredentials $userCredentials, UserCredentials $userCredentialsCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        } elseif($userCredentialsCredentials->id === $userCredentials->id){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(UserCredentials $userCredentials, UserCredentials $userCredentialsCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(UserCredentials $userCredentials, UserCredentials $userCredentialsCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(UserCredentials $userCredentials, UserCredentials $userCredentialsCredentials): bool
    {
        if($userCredentials->role === "System Admin"){
            return true;
        }
        return false;
    }
}
