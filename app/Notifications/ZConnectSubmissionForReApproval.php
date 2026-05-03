<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ZConnectSubmissionForReApproval extends Notification
{
    use Queueable;

    protected $courseName;
    protected $assignerName;
    protected $recipientName;
    protected $courseUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct ($courseName, $assignerName, $recipientName, $courseUrl)
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
            ->subject("You've been assigned to Re-Approve a Course")
            ->view('Zemails.courseReApproval', [
                'courseName' => $this->courseName,
                'assignerName' => $this->assignerName,
                'recipientName' => $this->recipientName,
                'courseUrl' => $this->courseUrl,
                'notifiable' => $notifiable,
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
