<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('App.Models.UserCredentials.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('enrollment_status.{id}', function($user,$id){
    return (int) $user->id === (int) $id;
});

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    \Log::info("Broadcast channel auth: userId=$user->id, requestedUserId=$userId");
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('channel-name', function($user){
    return true;
});

Broadcast::channel('Users', function ($user){
    return $user->UserInfos->hasRole('System Admin');
});

Broadcast::channel('bulk-user-added.{id}', function ($user, $id){
    return $user->id === (int) $id;
});

// course version update
Broadcast::channel('course-version.{courseId}', function ($user, $courseId) {
    return true;
});

// course assignment update
Broadcast::channel('course.assignments.{userInfoId}', function ($user, $userInfoId) {
    return true;
});

