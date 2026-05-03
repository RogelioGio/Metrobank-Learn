<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ZConnectDistributeCourseNotification extends Notification
{
    use Queueable;

    protected $notificationData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $notificationData)
    {
        $this->notificationData = $notificationData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Course Published: {$this->notificationData['CourseName']}")
            ->view('Zemails.publishCourse', [
                'first_name' => $notifiable->userInfo->first_name ?? 'User',
                'notifiable' => $notifiable,
                'courseName' => $this->notificationData['CourseName'],
                'messageText' => $this->notificationData['message'],
                'courseUrl' => url('/courses/' . $this->notificationData['course_id'] ?? '#'),
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
            //
        ];
    }
}
