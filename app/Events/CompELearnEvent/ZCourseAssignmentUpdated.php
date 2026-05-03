<?php
namespace App\Events\CompELearnEvent;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ZCourseAssignmentUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public int $userInfoId;

    public function __construct(int $userInfoId)
    {
        $this->userInfoId = $userInfoId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('course.assignments.' . $this->userInfoId);
    }

    public function broadcastAs()
    {
        return 'CourseAssignmentUpdated';
    }

    public function broadcastWith()
    {
        return [
            'userInfoId' => $this->userInfoId,
        ];
    }
}
