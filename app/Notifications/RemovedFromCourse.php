<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RemovedFromCourse extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Course $course,
        public UserInfos $courseAdmin,
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
        return ['mail','database','broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => 'You Have Been Unenrolled from a Course',
                        'shortdesc' => "You've been removed from one of your enrolled courses.",
                        'fulldesc' => 'You have been unenrolled from your course '.$this->course->courseName.'. This action was done by '. $this->courseAdmin->fullName(),
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/learner/learnercoursemanager/',
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
            "name" => "Removed from course",
            "shortdesc" => "You've been removed from one of your enrolled courses.",
            "fulldesc" => 'You have been unenrolled from your course '.$this->course->courseName.'. This action was done by '. $this->courseAdmin->fullName(),
            "doer" => $this->courseAdmin,
            "timedone" => now(),
        ];
    }
}
