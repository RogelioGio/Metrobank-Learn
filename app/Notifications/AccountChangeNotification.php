<?php

namespace App\Notifications;

use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use function PHPUnit\Framework\isEmpty;

class AccountChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public array $changes, public UserInfos $responsible)
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
        $changed = array_keys($this->changes);
        $string = "";
        if(!empty($changed)){
            $string = " Changes were made on: ".implode(', ', $changed);
        }

        
        $formatted = [];
        foreach($this->changes as $key => $value){
            $formatted[] = "new $key - $value";
        }
        $longString = implode(', ',$formatted);
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => 'Your Account Information Has Been Updated',
                        'shortdesc' => 'Some of your account details were recently modified in the MBLearn system.',
                        'fulldesc' => "For your security, we want to let you know that changes were made to your account information. 
                                    If you made these updates, no further action is needed. However, if you didn't authorize this change, 
                                    please review your account immediately or contact the system administrator for assistance.".$string,
                        'followup' => 'Check here',
                        'link' => 'https://mb-authoringtool.online/login',
                    ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $changed = array_keys($this->changes);
        $string = implode(', ', $changed);
        return [
            "type" => "Account",
            "name" => "Account Change",
            "shortdesc" => "Some of your account details were recently modified in the MBLearn system.",
            "fulldesc" => "For your security, we want to let you know that changes were made to your account information. 
                                    If you made these updates, no further action is needed. However, if you didn't authorize this change, 
                                    please review your account immediately or contact the system administrator for assistance.
                                    Changes were made on: ".$string,
            "doer" => $this->responsible,
            "timedone" => now(),
        ];
    }
}
