<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyUserSelfEnrollmentApproved extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Course $course, public UserInfos $courseAdmin)
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
                        'heading' => 'Your Self-Enrollment Request Has Been Approved',
                        'shortdesc' => "Your request to enroll to course ".$this->course->courseName ." has been approved  you can now start learning!",
                        'fulldesc' => "Good news! Your self-enrollment request for the course ".$this->course->courseName." has been approved by ".$this->courseAdmin->fullName()."
                                     You now have full access to the course materials and can begin your learning journey right away. 
                                     Visit your dashboard to start exploring the course content.",
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/learner/dashboard/',
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
            "type" => "Request",
            "name" => "ApproveSelfEnrollment",
            "shortdesc" => "Your request to enroll to course ".$this->course->courseName ." has been approved  you can now start learning!",
            'fulldesc' => "Good news! Your self-enrollment request for the course ".$this->course->courseName." has been approved by ".$this->courseAdmin->fullName()."
                                     You now have full access to the course materials and can begin your learning journey right away. 
                                     Visit your dashboard to start exploring the course content.",
            "timedone" => now(),
        ];
    }
}
