<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationsMarkedAsRead implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    /**
     * Create a new event instance.
     */
    public function __construct($userId)
    {
        $this->userId = $userId;
        \Log::info('Broadcasting to: notifications.' . $this->userId);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.'. $this->userId),
        ];
    }
    public function broadcastWith()
{
    return [
        'userId' => $this->userId,
        'timestamp' => now()
    ];
}
    public function broadcastAs()
    {
        return 'notifications-read-all';
    }
}
