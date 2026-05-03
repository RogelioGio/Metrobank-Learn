<?php

namespace App\Notifications;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MoveEnrollmentDeadlineNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Course $course,
        public string $adminName,
        public $end_date,
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
                        'heading' => 'Enrollment Deadline Extended',
                        'shortdesc' => 'Your course enrollment deadline has been extended.',
                        'fulldesc' => 'Good news! The deadline for completing course '.$this->course->courseName.' has been extended to '.$this->end_date.'
                                    You now have additional time to finish your lessons, activities, and assessments before the new due date.
                                    Make the most of this opportunity to complete all course requirements successfully.',
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
            "name" => "Moved Enrollment",
            "shortdesc" => 'Your enrollment to '.$this->course->courseName. ' has been moved to '.$this->end_date,
            "fulldesc" => 'Good news! The deadline for completing course '.$this->course->courseName.' has been extended to '.$this->end_date.'
                        You now have additional time to finish your lessons, activities, and assessments before the new due date.
                        Make the most of this opportunity to complete all course requirements successfully.',
            "doer" => $this->adminName,
            "timedone" => now(),
        ];
    }
}
