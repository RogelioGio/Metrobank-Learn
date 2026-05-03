<?php
namespace App\Events\CompELearnEvent;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ZCourseVersionUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public int $courseId;

    public function __construct(int $courseId)
    {
        $this->courseId = $courseId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('course-version.' . $this->courseId);
    }

    public function broadcastAs()
    {
        return 'CourseVersionUpdated';
    }

    public function broadcastWith()
    {
        return [
            'courseId' => $this->courseId,
        ];
    }
}
