<?php

namespace App\Notifications;

use App\Models\AssignedCourseAdminNotify;
use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCourseAdminsRejected extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public UserInfos $rejector,
        public Course $course,
        public AssignedCourseAdminNotify $assign
    )
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => 'Course Archival Rejected',
                        'shortdesc' => 'The archival of course '.$this->course->courseName.' has been rejected',
                        'fulldesc' => 'The archival for this course on '.$this->assign->WillArchiveAt.' was rejected by '.$this->rejector->fullName().'. Due to these events,
                        You can now enroll more users on this course',
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/learner/course/'.$this->course->id,
                    ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            "type" => "Course",
            "name" => "Course Archival Rejected",
            "shortdesc" => 'The archival of course '.$this->course->courseName.' has been rejected',
            "fulldesc" => 'The archival for this course on '.$this->assign->WillArchiveAt.' was rejected by '.$this->rejector->fullName().'. Due to these events,
                        You can now enroll more users on this course',
            "doer" => $this->rejector,
            "timedone" => now(),
        ];
    }
}
