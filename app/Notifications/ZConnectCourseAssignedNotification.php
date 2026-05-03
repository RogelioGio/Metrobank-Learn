<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ZConnectCourseAssignedNotification extends Notification
{
    use Queueable;

    protected $courseName;
    protected $assignerName;
    protected $recipientName;
    protected $courseUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($courseName, $assignerName, $courseUrl, $recipientName)
    {
        $this->courseName = $courseName;
        $this->assignerName = $assignerName;
        $this->recipientName = $recipientName;
        $this->courseUrl = $courseUrl;
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
            ->subject("You've been assigned to a course")
            ->view('Zemails.assignApprover', [
                'courseName' => $this->courseName,
                'assignerName' => $this->assignerName,
                'recipientName' => $this->recipientName,
                'courseUrl' => $this->courseUrl,
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
