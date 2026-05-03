<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\SelfEnrollmentRequest;
use App\Models\UserInfos;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotifyCourseAdminsSelfEnrollmentApproved extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Course $course, public array $learners, public UserInfos $enroller)
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
        $learnerCount = array_count_values($this->learners);
        $learnerInfo = UserInfos::whereIn('id', $this->learners)->get();
        $namesString = implode(', ',$learnerInfo->map(fn($info) => $info->fullName())->all());
        $startingString = "A ";
        if($learnerCount > 1){
            $startingString = "Multiple";
        }
        // foreach($this->learners as $learner){
        //     $users[] = $learner->fullName();
        // }
        return (new MailMessage)
                    ->view('emails.notificationTemplate', [
                        'heading' => $startingString.' Self-Enrollment Requests Approved',
                        'shortdesc' => $startingString." learners' self-enrollment requests for your course have been approved.",
                        'fulldesc' => $startingString.' learner(s) have been successfully approved for self-enrollment in course '.$this->course->courseName.
                                        '. These learners now have access to the course materials and activities. Learner name: '.$namesString,
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
        $learnerCount = array_count_values($this->learners);
        $learnerInfo = UserInfos::whereIn('id', $this->learners)->get();
        $namesString = implode(', ',$learnerInfo->map(fn($info) => $info->fullName())->all());
        $startingString = "A ";
        if($learnerCount > 1){
            $startingString = "Multiple";
        }
        return [
            "type" => "Request",
            "name" => "Self Enrollment Approved",
            "shortdesc" => $startingString." learners' self-enrollment requests for your course have been approved.",
            'fulldesc' => $startingString.' learner(s) have been successfully approved for self-enrollment in course '.$this->course->courseName.
                        '. These learners now have access to the course materials and activities. Learner name: '.$namesString,
            "timedone" => now(),
        ];
    }
}
