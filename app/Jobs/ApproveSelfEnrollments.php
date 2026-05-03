<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\SelfEnrollmentRequest;
use App\Models\User_Test_Attempt;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Notifications\NotifyCourseAdminsSelfEnrollmentApproved;
use App\Notifications\NotifyUserSelfEnrollmentApproved;
use App\Notifications\SelfEnrollmentRequestUpdate;
use App\Services\UserLogService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ApproveSelfEnrollments implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $selfenrollmentrequests,
        public UserInfos $courseAdmin,
        public string $ip,
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $requests = collect($this->selfenrollmentrequests);
        $ids = $requests->pluck('request_id');
        SelfEnrollmentRequest::whereIn('id', $ids)->where('status', 'pending')->update(['status' => 'approved']);
        $selfEnrollments = SelfEnrollmentRequest::whereIn('id', $ids)
                                            ->with('user.userCredentials', 'course')
                                            ->get();
        $requests = $requests->keyBy('request_id');
        $selfs = $selfEnrollments->keyBy('id');
        $selfEnrollmentsloop = $selfs->map(function($enrol, $id) use($requests){
            $match = $requests->get($id);
            return array_merge(
                $enrol->toArray(),
                $match ?? []
            );
        });
        $insertValues = [];
        foreach($selfEnrollmentsloop as $selfenrollment){
            $insertValues[] = [
                "user_id" => $selfenrollment['user_id'],
                "course_id" => $selfenrollment['course_id'],
                "enroller_id" => $this->courseAdmin->id,
                'start_date' => $selfenrollment['start_date'],
                'end_date' => $selfenrollment['end_date'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Enrollment::insert($insertValues);
        $enrollmentIds = [];
        $allTestIds = [];
        $enrolledUsers = [];
        $logging = [];
        $successCount = 0;
        foreach($selfEnrollments as $selfenrollment){
            $enrollment = Enrollment::where('user_id', $selfenrollment['user_id'])
                                    ->where('course_id', $selfenrollment['course_id'])
                                    ->with('course.tests', 'enrolledUser', 'course.lessons', 'course.attachments')
                                    ->orderBy('created_at', 'desc')
                                    ->first();
            $enrollmentIds[] = $enrollment->id;
            $course = $enrollment->course;
            $user = $enrollment->enrolledUser;
            $logging[$user->fullName()] = $course->courseName;
            $enrolledUsers[] = $selfenrollment['user_id'];
            $user->lessons()->syncWithoutDetaching(
                array_fill_keys($course->lessons->pluck('id')->all(), ['is_completed' => false, 'enrollment_id' => $enrollment->id])
            );

            foreach ($course->tests as $testModel) {
                $allAttempts[] = [
                    'user_id' => $user->id,
                    'test_id' => $testModel->id,
                    'enrollment_id' => $enrollment->id,
                    'score' => null,
                    'is_completed' => false,
                    'started_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $allTestIds[] = $testModel->id;
            }

            $user->attachments()->syncWithoutDetaching(
                array_fill_keys($course->attachments->pluck('id')->all(), ['is_completed' => false, 'enrollment_id' => $enrollment->id])
            );
            $successCount += 1;
        }
        if($successCount < 1){
            return; // stop the queue if no successful
        }
        User_Test_Attempt::insert($allAttempts);


        $newAttempts = User_Test_Attempt::whereIn('user_id', $enrolledUsers)
                ->whereIn('test_id', $allTestIds)
                ->orderBy('id')
                ->get();

        foreach($newAttempts as $attempt){
            $ids = [];
            foreach($attempt->test->questions as $question){
                    $ids[] = $question->id;
            }
            $attempt->questions()->syncWithoutDetaching($ids);
        }

        $course = $selfEnrollments->first()->course;
        $courseAdmins = $course->assignedCourseAdmins->pluck('userCredentials')->filter();
        $learners = [];
        $learnercreds = [];

        foreach($selfEnrollments as $selfenrollment){
            $learnerIds = $selfEnrollments->map(fn($enroll) => $enroll->user_id)->all();
            $learnercreds = $selfEnrollments
            ->map(fn($enroll) => $enroll->user->userCredentials)
            ->filter() // remove nulls if any
            ->all();
        }

        Notification::send($courseAdmins, new NotifyCourseAdminsSelfEnrollmentApproved($course, $learnerIds, $this->courseAdmin));
        Notification::send($learnercreds, new NotifyUserSelfEnrollmentApproved($course, $this->courseAdmin));
        $log = new UserLogService();
        $log->log(
            $this->courseAdmin->id,
            'ApproveSelfEnrollmentRequests',
            $this->courseAdmin->fullName().' has approved the self enrollments '.json_encode($logging),
            $this->ip,
        );

        // $groupedByCourse = $selfenrollments->get()->groupBy('course_id');
        // foreach($groupedByCourse as $courseId => $enrollments){
        //     $course = $enrollments->first()->course;
        //     $courseAdmins = $course->assignedCourseAdmins->pluck('userCredentials')->filter();

        //     if($courseAdmins->isNotEmpty()){
        //         Log::info('Testing Approving Self Enrollments', [$course->courseName, $enrollments]);
        //         Notification::send($courseAdmins, new NotifyCourseAdminsSelfEnrollmentApproved($course->courseName, $enrollments));
        //     }
        // }
        // $groupedByUser = $selfenrollments->get()->groupBy('user_id');
        // foreach($groupedByUser as $userId => $enrollments){
        //     $user = $enrollments->first()->user->userCredentials;
        //     $courseIds = $enrollments->pluck('course_id')->all();
        //     $courses = Course::whereIn('id', $courseIds)->get()->pluck('courseName')->all();

        //     $user->notify(new NotifyUserSelfEnrollmentApproved($courses));
        // }
    }
}
