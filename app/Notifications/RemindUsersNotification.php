<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RemindUsersNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public UserInfos $alerter,
        public Course $course,
    )
    {

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
                        'heading' => 'Course Reminder from '.$this->alerter->fullName(),
                        'shortdesc' => 'Your instructor has sent a reminder about your course '.$this->course->courseName,
                        'fulldesc' => 'This message is sent to notify students that their instructor has issued a reminder or announcement related to the course. It may include important updates, approaching deadlines, or encouragement to stay active and engaged in the course. Students are encouraged to review the course materials, complete pending tasks, or check for any new announcements or assignments shared by their instructor.',
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/learner/course/'.$this->course->id,,
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
            "name" => "CourseReminderNotification",
            "shortdesc" => 'Your instructor has sent a reminder about your course '.$this->course->courseName,
            "fulldesc" => 'This message is sent to notify students that their instructor has issued a reminder or announcement related to the course. It may include important updates, approaching deadlines, or encouragement to stay active and engaged in the course. Students are encouraged to review the course materials, complete pending tasks, or check for any new announcements or assignments shared by their instructor.',
            "doer" => $this->alerter,
            "timedone" => now(),
        ];
    }
}
