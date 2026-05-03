<?php

namespace App\Jobs;

use App\Models\UserInfos;
use App\Models\ZCompELearnNotificationMessage;
use App\Models\Course;
use App\Notifications\NotifyCoursePublished;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class NotifyAllCourseAdmins implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $course;
    protected $assignerName;

    /**
     * Create a new job instance.
     */
    public function __construct(Course $course, string $assignerName)
    {
        $this->course = $course;
        $this->assignerName = $assignerName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        UserInfos::whereHas('roles', function ($query) {
            $query->whereIn('role_name', ['Course Admin', 'System Admin']);
        })
        ->chunk(100, function ($admins) {
            foreach ($admins as $admin) {
                ZCompELearnNotificationMessage::create([
                    'user_info_id' => $admin->id,
                    'course_id' => $this->course->id,
                    'CourseName' => $this->course->CourseName,
                    'AssignerName' => $this->assignerName,
                    'Message' => "A new course '{$this->course->CourseName}' has been published by {$this->assignerName}.",
                    'ReadAt' => null,
                ]);

                // if ($admin->userCredentials) {
                //     Notification::send(
                //         $admin->userCredentials,
                //         new NotifyCoursePublished($this->course, $this->assignerName)
                //     );
                // }
            }
        });
    }
}
