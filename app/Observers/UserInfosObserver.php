<?php

namespace App\Observers;

use App\Models\Role;
use App\Models\UserInfos;

class UserInfosObserver
{
    /**
     * Handle the UserInfos "created" event.
     */
    public function created(UserInfos $userInfos): void
    {
        $userRole = Role::where('role_name', 'Learner')->first();
        if($userRole){
            $userInfos->roles()->attach($userRole->id);
        }
    }

    /**
     * Handle the UserInfos "updated" event.
     */
    public function updated(UserInfos $userInfos): void
    {
        //
    }

    /**
     * Handle the UserInfos "deleted" event.
     */
    public function deleted(UserInfos $userInfos): void
    {
        //
    }

    /**
     * Handle the UserInfos "restored" event.
     */
    public function restored(UserInfos $userInfos): void
    {
        //
    }

    /**
     * Handle the UserInfos "force deleted" event.
     */
    public function forceDeleted(UserInfos $userInfos): void
    {
        //
    }
}
