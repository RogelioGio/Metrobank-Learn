<?php
namespace App\Events\CompELearnEvent;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ViewerAssign implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(array $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('notifications.' . $this->message['user_credentials_id']);
    }

    public function broadcastAs()
    {
        return 'ViewerAssign';
    }

    public function broadcastWith()
    {
        return [
            'notification' => $this->message,
        ];
    }
}
