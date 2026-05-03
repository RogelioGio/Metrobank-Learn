<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CourseDueSoonNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Enrollment $enrollment)
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
                        'heading' => 'Course Due Soon',
                        'shortdesc' => 'Your enrolled course '.$this->enrollment->course->courseName.' is approaching its due date. Make sure to complete all lessons and tests before the deadline.',
                        'fulldesc' => 'The course you are enrolled in is nearing its due date in '.$this->enrollment->end_date.' Please review your remaining lessons, activities, and assessments to ensure all requirements are completed on time. Staying on track will help you avoid any penalties or the need for course retakes.',
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/learner/course/'.$this->enrollment->course->id,
                    ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $course = $this->enrollment->course;
        $deadline = $this->enrollment->end_date;
        $deadlineInPHTime = Carbon::parse($deadline)->timezone('Asia/Hong_Kong');
        $now = now();
        $daysBetween = round($now->diffInDays($deadline));
        return [
            "type" => "Course",
            "name" => "CourseDueSoonNotification",
            "shortdesc" => 'Your enrolled course '.$this->enrollment->course->courseName.' is approaching its due date. Make sure to complete all lessons and tests before the deadline.',
            "fulldesc" => 'The course you are enrolled in is nearing its due date in '.$this->enrollment->end_date.' Please review your remaining lessons, activities, and assessments to ensure all requirements are completed on time. Staying on track will help you avoid any penalties or the need for course retakes.',
            "doer" => "Automated",
            "timedone" => now(),
        ];
    }
}
