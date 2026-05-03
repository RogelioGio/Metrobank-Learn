<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BulkEnrollNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Course $course, public array $learners, public UserInfos $enroller, public int $count)
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
        return ['mail','database','broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $heading = "";
        $shortDesc = "";
        $longDesc = "";
        if($this->count >1){
            $heading = "New Learners Enrolled";
            $shortDesc = "Many new learners have been enrolled in course: ".$this->course->courseName;
        } else {
            $heading = "A New Learner Enrolled";
            $shortDesc = "A new learner has been enrolled in course: ".$this->course->courseName;
        }
        $longDesc = $shortDesc." You can review their details, monitor their progress, and assist them as they begin their learning journey.";
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => $heading,
                        'shortdesc' => $shortDesc,
                        'fulldesc' => $longDesc,
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
        $shortDesc = "";
        $longDesc = "";
        if($this->count >1){
            $shortDesc = "Many new learners have been enrolled in course: ".$this->course->courseName;

        } else {
            $shortDesc = "A new learner has been enrolled in course: ".$this->course->courseName;
        }
        $longDesc = $shortDesc." You can review their details, monitor their progress, and assist them as they begin their learning journey.";
        return [
            "type" => "Request",
            "name" => "Users Enrolled",
            "shortdesc" => $shortDesc,
            "fulldesc" => $longDesc,
            "doer" => $this->enroller,
            "timedone" => now(),
        ];
    }
}
