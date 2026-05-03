<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class UserEnrolled extends Notification implements ShouldQueue
{
    use Queueable;

    public $course;
    public $enroller;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Enrollment $enrollment, )
    {
       $this->course = $enrollment->course;
       $this->enroller = $enrollment->enroller;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['broadcast', 'database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => "You've Been Enrolled in a New Course",
                        'shortdesc' => $this->enroller->fullName().'has enrolled you to a new course: '.$this->course->courseName,
                        'fulldesc' => $this->enroller->fullName().'has enrolled you to a new course: '.$this->course->courseName." from ".$this->enrollment->start_date." to ". $this->enrollment->start_date.
                                " You can now access the course materials, start lessons, and participate in activities. Check your dashboard to begin your learning journey.",
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
            "name" => "Enrollment",
            "shortdesc" => $this->enroller->fullName().'has enrolled you to a new course: '.$this->course->courseName,
            "fulldesc" => $this->enroller->fullName().'has enrolled you to a new course: '.$this->course->courseName." from ".$this->enrollment->start_date." to ". $this->enrollment->start_date.
                        " You can now access the course materials, start lessons, and participate in activities. Check your dashboard to begin your learning journey.",
            "doer" => $this->enrollment->enroller->fullName(),
            "timedone" => now(),
        ];
    }
}
