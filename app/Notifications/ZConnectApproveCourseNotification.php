<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ZConnectApproveCourseNotification extends Notification
{
    use Queueable;

    protected $courseName;
    protected $reviewerName;
    protected $recipientName;
    protected $response;
    protected $courseUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct ($courseName, $reviewerName, $response, $recipientName, $courseUrl)
    {
        $this->courseName = $courseName;
        $this->reviewerName = $reviewerName;
        $this->recipientName = $recipientName;
        $this->response = $response;
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
            ->subject("Course {$this->response}: {$this->courseName}")
            ->view('Zemails.approverResponse', [
                'courseName' => $this->courseName,
                'reviewerName' => $this->reviewerName,
                'recipientName' => $this->recipientName,
                'response' => $this->response,
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
