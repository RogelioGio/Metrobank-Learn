<?php

namespace App\Services;

use App\Models\UserInfos;

class UserLogService{
    /**
     * Log an action for a given user.
     *
     * @param int $userId
     * @param string $logType
     * @param string $logDescription
     * @param string|null $ip
     * @return \App\Models\UserLog
     */
    public function log(int $userId, string $logType, string $logDescription, ?string $ip = null)
    {
        $user = UserInfos::find($userId);

        if(!$user) {
            throw new \Exception("User not found with ID {$userId}");
        }

        return $user->logs()->create([
            'log_type' => $logType,
            'log_description' => $logDescription,
            'ip_address' => $ip ?? request()->ip()
        ]);

    }
}

?>
