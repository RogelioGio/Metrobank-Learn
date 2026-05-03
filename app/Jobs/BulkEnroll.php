<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User_Test_Attempt;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Notifications\BulkEnrollNotification;
use App\Notifications\NotifyCourseAdminsSelfEnrollmentApproved;
use App\Notifications\NotifyUserSelfEnrollmentApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class BulkEnroll implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $bulk,
        public array $userids,
        public array $courseids,
        public array $existingEnrollments,
        public UserInfos $adder,
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $userIds = $this->userids;
        $courseIds = $this->courseids;

        $users = UserInfos::with('userCredentials')->whereIn('id', $userIds)->get()->keyBy('id');
        $courses = Course::with(['lessons', 'tests.questions', 'attachments'])->whereIn('id', $courseIds)->get()->keyBy('id');
        $firstCourseId = $courseIds[0]; // current front end only gives one course where they all enroll
        $course1 = $courses[$firstCourseId];
        $courseAdminsCreds = $course1->assignedCourseAdmins->map(function($admin){
            return $admin->userCredentials;
        });

        $existingEnrollments = $this->existingEnrollments;

        $count = 0;
        $enrolledUsers = [];
        $enrollmentIds = [];
        $enrolledUsersModel = [];
        $allAttempts = [];
        $allTestIds = [];

        foreach ($this->bulk as $single) {
            $key = $single['user_id'].'-'.$single['course_id'];

            if (in_array($key, $existingEnrollments)) {
                continue;
            }

            $user = $users[$single['user_id']];
            $course = $courses[$single['course_id']];

            $user->lessons()->syncWithoutDetaching(
                array_fill_keys($course->lessons->pluck('id')->all(), ['is_completed' => false, 'enrollment_id' => $single['enrollment_id']])
            );
            Log::info('lessons', array_fill_keys($course->lessons->pluck('id')->all(), ['is_completed' => false, 'enrollment_id' => $single['enrollment_id']]));
            $count += 1;

            foreach ($course->tests as $testModel) {
                $allAttempts[] = [
                    'user_id' => $user->id,
                    'test_id' => $testModel->id,
                    'enrollment_id' => $single['enrollment_id'],
                    'score' => null,
                    'is_completed' => false,
                    'started_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $allTestIds[] = $testModel->id;
            }

            $user->attachments()->syncWithoutDetaching(
                array_fill_keys($course->attachments->pluck('id')->all(), ['is_completed' => false, 'enrollment_id' => $single['enrollment_id']])
            );
            $enrolledUsers[] = $user->id;
            $enrollmentIds[] = $single['enrollment_id'];
        }
        User_Test_Attempt::insert($allAttempts);

        $newAttempts = User_Test_Attempt::whereIn('user_id', $enrolledUsers)
                ->whereIn('test_id', $allTestIds)
                ->whereIn('enrollment_id', $enrollmentIds)
                ->where('score' , null)
                ->get();

        foreach($newAttempts as $attempt){
            $ids = [];
            foreach($attempt->test->questions as $question){
                    $ids[] = $question->id;
            }
            $attempt->questions()->syncWithoutDetaching($ids);
        }

        Notification::send($courseAdminsCreds, new BulkEnrollNotification($course1, $enrolledUsersModel, $this->adder, $count));
    }
}
