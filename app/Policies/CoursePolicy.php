<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\UserCredentials;
use Illuminate\Auth\Access\Response;

class CoursePolicy
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
    public function view(UserCredentials $userCredentials, Course $course): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(UserCredentials $userCredentials): bool
    {
        if($userCredentials->userInfos->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(UserCredentials $userCredentials, Course $course): bool
    {
        if($userCredentials->userInfos->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(UserCredentials $userCredentials, Course $course): bool
    {
        if($userCredentials->userInfos->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(UserCredentials $userCredentials, Course $course): bool
    {
        if($userCredentials->userInfos->role === "System Admin"){
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(UserCredentials $userCredentials, Course $course): bool
    {
        if($userCredentials->userInfos->role === "System Admin"){
            return true;
        }
        return false;
    }
}
