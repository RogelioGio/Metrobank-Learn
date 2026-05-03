<?php

namespace App\Jobs;

use App\Models\SelfEnrollmentRequest;
use App\Models\UserCredentials;
use App\Notifications\NotifyCourseAdminsForApproval;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class BulkSelfEnroll implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $bulk,
        public array $existingSelfEnrollRequests,
        public array $existingEnrollment,
        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Course> */
        public Collection $courses,
        public UserCredentials $user
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $insertValue = [];
        $userinfo = $this->user->userInfos;
        foreach($this->bulk as $single){
            $key = $userinfo->id.'-'.$single['course_id'];
            if(in_array($key, $this->existingEnrollment)){
                continue;
            }
            if(in_array($key, $this->existingSelfEnrollRequests)){
                continue;
            }
            $insertValue[] = [
                'user_id'    => $userinfo->id,
                'course_id'  => $single['course_id'],
                'start_date' => $single['start_date'] ?? null,
                'end_date'   => $single['end_date'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $course = $this->courses[$single['course_id']];
            $course_admins = $course->assignedCourseAdmins->load(['userCredentials']);
            $course_admins_notifiable = $course_admins->map(function($info) {
                $creds = $info->userCredentials;
                return $creds;
            });

            Notification::send($course_admins_notifiable, new NotifyCourseAdminsForApproval($course, $userinfo));
        }
        SelfEnrollmentRequest::insert($insertValue);
    }
}
