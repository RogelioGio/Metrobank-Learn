<?php

namespace App\Notifications;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LearnerRemovedFromCourse extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Course $course,
        public string $courseAdmin,
        public string $learnerName,
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
                        'heading' => 'Learner Unenrolled from Course',
                        'shortdesc' => $this->learnerName.' has been unenrolled from your course '.$this->course->courseName,
                        'fulldesc' => $this->learnerName.' has been unenrolled from your course '.$this->course->courseName.'. This action was done by '. $this->courseAdmin,
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/courseadmin/course/'.$this->course->id,
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
            "name" => "Learner removed from course",
            "shortdesc" => $this->learnerName.' has been unenrolled from your course '.$this->course->courseName,
            "fulldesc" => $this->learnerName.' has been unenrolled from your course '.$this->course->courseName.'. This action was done by '. $this->courseAdmin, 
            "doer" => $this->courseAdmin,
            "timedone" => now(),
        ];
    }
}
