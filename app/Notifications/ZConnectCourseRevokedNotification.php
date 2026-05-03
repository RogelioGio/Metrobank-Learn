<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ZConnectCourseRevokedNotification extends Notification
{
    use Queueable;

    protected $courseName;
    protected $assignerName;
    protected $recipientName;

    /**
     * Create a new notification instance.
     */
    public function __construct($courseName, $assignerName, $recipientName)
    {
        $this->courseName = $courseName;
        $this->assignerName = $assignerName;
        $this->recipientName = $recipientName;
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
            ->subject("Your course approval has been revoked")
            ->view('Zemails.revokeApprover', [
                'courseName' => $this->courseName,
                'assignerName' => $this->assignerName,
                'recipientName' => $this->recipientName,
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
