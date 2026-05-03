<?php

namespace App\Events;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\UserInfos;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LearnerProgressUpdate implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $user;
    public $course;
    public $modulesCount;
    public $completedModules;
    

    public function __construct(UserInfos $user, Course $course, int $modulesCount, int $completedModules)
    {
        $this->user = $user;
        $this->course = $course;
        $this->modulesCount = $modulesCount;
        $this->completedModules = $completedModules;
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
