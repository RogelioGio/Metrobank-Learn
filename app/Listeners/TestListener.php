<?php

namespace App\Listeners;

use App\Events\TestEvent;
use App\Models\UserInfos;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class TestListener
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
    public function handle(TestEvent $event): void
    {
        $user = UserInfos::find(134);
        $user->update(['middle_name' => 'LOL']);
    }
}
