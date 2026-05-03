<?php

namespace App\Events;

use App\Models\UserInfos;
use App\Models\ZCompELearnCourseViewer;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewerResponded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $course;
    public $reviewer;

    /**
     * Create a new event instance.
     */
    public function __construct ($course, UserInfos $reviewer)
    {
        $this->course = $course;
        $this->reviewer = $reviewer;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
