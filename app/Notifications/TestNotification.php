<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class TestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
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
        return ['database','broadcast','mail'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Sample Test with notification type',
            'body' => 'This is a test notification.',
            'notification_type' => 'general',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        Log::info('Nag send dapat email', []);
        return (new MailMessage)
            ->subject('Test Notification')
            ->line('This is a test notification sent via email.')
            ->action('View Notification', url('/notifications'))
            ->line('Thank you for using our application!');
    }

    public function toBroadcast($notifiable){
        return new BroadcastMessage([
            'title' => 'This is an general notification to be listerd',
            'body' => 'This is a test notification.',
        ]);
    }
}
