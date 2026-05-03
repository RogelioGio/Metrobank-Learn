<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCourseAdminsForApproval extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Course $course, public UserInfos $user)
    {
        //
    }

    /**
     * Get the notification"s delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ["mail", "database", "broadcast"];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->view("emails.notificationTemplate", [
                        "heading" => "You've Been Assigned to a Course",
                        "shortdesc" => "You've been assigned as the course admin for the course: ".$this->course->courseName,
                        "fulldesc" => "You've been successfully assigned as the teacher for this course by ". $this->user->fullName()." 
                                You can now manage lessons, upload materials, monitor student progress, and facilitate learning activities.
                                Check the course dashboard to start preparing your content and engage with your students.",
                        "followup" => "Check here",
                        "link" => "https://mb-authoringtool.online/courseadmin/course/".$this->course->id,
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
            "name" => "You've Been Assigned to a Course",
            "shortdesc" => "You've been assigned as the course admin for the course: ".$this->course->courseName,
            "fulldesc" => "You've been successfully assigned as the teacher for this course by ". $this->user->fullName()." 
                                You can now manage lessons, upload materials, monitor student progress, and facilitate learning activities.
                                Check the course dashboard to start preparing your content and engage with your students.",
            "doer" => $this->user->fullName(),
            "timedone" => now(),
        ];
    }
}
