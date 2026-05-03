<?php

namespace App\Listeners;

use App\Models\UserCredentials;
use App\Models\UserInfos;
use Illuminate\Auth\Events\Failed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class TrackFailedLogins
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Failed $event): void
    {
        $key = 'login-attempts:' . Str::lower($event->credentials['MBemail']);
        
        if(RateLimiter::tooManyAttempts($key,5)){
            $user = UserCredentials::where('MBemail', $event->credentials['MBemail'])->first();
            if($user->timeout_count < 3){
                $user->increment('timeout_count');
                return;
            }
            $user->userInfos->update(['status' => 'Inactive']);
        }
    }
}
