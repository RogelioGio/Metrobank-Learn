<?php 

namespace App\helpers;

use App\Models\Activitylogs;

class LogActivityHelper{
    public static function logActivity($user_id, $action, $user_name, $description = null, $target = null){
        Activitylogs::create([
            'user_id' => $user_id,
            'action' => $action,
            'user_name' => $user_name,
            'description' => $description,
            'target' => $target,
        ]);
    }
}

