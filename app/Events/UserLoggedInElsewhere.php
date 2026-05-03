<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserLoggedInElsewhere implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userID;
    public $connection = 'sync'; // <--- disables queue


    /**
     * Create a new event instance.
     */
    public function __construct($userID)
    {
        $this->userID = $userID;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.UserCredentials.{$this->userID}")
        ];
    }

    public function broadcastAs(){
        return 'UserLoggedInElsewhere';
    }

    public function broadcastWith()
    {
        return [
            'message' => 'Your account has been logged in from another device.'
        ];
    }

}
