<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyAssignedCourseAdmin extends Notification
{
    use Queueable;

    protected $course;
    protected $user; 
    /**
     * Create a new notification instance.
     */
    public function __construct(Course $courseModel, UserInfos $userInfos)
    {
        $this->course = $courseModel;
        $this->user = $userInfos; 
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'broadcast', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => 'New Self-Enrollment Request Received',
                        'shortdesc' => $this->user->fullName().' has requested to enroll in your course.',
                        'fulldesc' => $this->user->fullName().' has submitted a self-enrollment request for course. '.$this->course->courseName.' 
                                     Please review the request and decide whether to approve or reject it. 
                                    Timely action will help ensure that students can begin their learning activities without delay.',
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
            "shortdesc" => $this->user->fullName().' has been unenrolled from your course '.$this->course->courseName,
            "fulldesc" => $this->user->fullName().' has submitted a self-enrollment request for course. '.$this->course->courseName.' 
                                     Please review the request and decide whether to approve or reject it. 
                                    Timely action will help ensure that students can begin their learning activities without delay.',
            "doer" => $this->user->fullName(),
            "timedone" => now(),
        ];
    }
}
