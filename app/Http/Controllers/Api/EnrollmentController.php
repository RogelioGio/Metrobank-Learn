<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\RecentlyOpenedCourseController;
use App\Http\Requests\BulkStoreEnrollmentRequest;
use App\Http\Requests\GetEndsingleesRequest;
use App\Http\Requests\MoveEnrollmentEndDateRequest;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpsingleeEnrollmentRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\EnrollmentResource;
use App\Jobs\BulkEnroll;
use App\Models\Attempt_Question;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearnerRecentCourse;
use App\Models\User_Test_Attempt;
use App\Models\UserInfos;
use App\Models\UserLog;
use App\Notifications\LearnerRemovedFromCourse;
use App\Notifications\MoveEnrollmentDeadlineNotification;
use App\Notifications\RemindUsersNotification;
use App\Notifications\RemovedFromCourse;
use App\Notifications\UserEnrolled;
use App\Services\UserLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EnrollmentResource::collection(Enrollment::query()->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function bulkStore(StoreEnrollmentRequest $request)
    {
        $singlea = $request->validated();
        $enrollment = Enrollment::firstOrCreate($singlea);
        return new EnrollmentResource($enrollment);
    }

    public function bulk(BulkStoreEnrollmentRequest $request){
        $bulk = $request->validated();
        $adder = $request->user()->userInfos;

        $userIds = collect($bulk)->pluck('user_id')->unique();
        $courseIds = collect($bulk)->pluck('course_id')->unique();

        $users = UserInfos::with('userCredentials')->whereIn('id', $userIds)->get()->keyBy('id');
        $courses = Course::with(['lessons', 'tests.questions', 'attachments'])->whereIn('id', $courseIds)->get()->keyBy('id');

        $existingEnrollments = Enrollment::whereIn('user_id', $userIds)
            ->whereIn('course_id', $courseIds)
            ->whereNot(function($query){
                $query->where('enrollment_status', 'failed');
            })
            ->get()
            ->map(fn($e) => $e->user_id.'-'.$e->course_id)
            ->toArray();



        $test = [];
        $newBulk = [];
        $logs = [];
        $count = 0;
        $delUser = [];
        $delCourse = [];
        foreach ($bulk as $single) {
            $key = $single['user_id'].'-'.$single['course_id'];
            $user = $users[$single['user_id']];
            $course = $courses[$single['course_id']];

            if (in_array($key, $existingEnrollments)) {
                $test[] = ["Message" => "{$single['user_id']} is already enrolled in {$single['course_id']}"];
                $logs[] = [
                    "user_infos_id" => $adder->id,
                    "log_type" => 'BulkEnrollment',
                    "log_description" => $adder->fullName().' was unsuccessful in enrolling '.$user->fullName().' to course '.$course->courseName,
                    "ip_address" => $request->ip(),
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }
            $delUser[] = $single['user_id'];
            $delCourse[] = $single['course_id'];

            $enrollment = Enrollment::firstOrCreate($single);
            $test[] = $enrollment;
            $newBulk[] = array_merge($single, ['enrollment_id' => $enrollment->id]);
            $user->userCredentials->notify(new UserEnrolled($enrollment));
            $logs[] = [
                "user_infos_id" => $adder->id,
                "log_type" => 'BulkEnrollment',
                "log_description" => $adder->fullName().' has enrolled '.$user->fullName().' to course '.$course->courseName,
                "ip_address" => $request->ip(),
                "log_timestamp" => now(),
                "created_at" => now(),
                "updated_at" => now(),
            ];
            $count += 1;
        }
        UserLog::insert($logs);
        Enrollment::whereIn('user_id', $delUser)
            ->whereIn('course_id', $delCourse)
            ->where('enrollment_status', 'failed')
            ->delete();
        if($count > 0){
            BulkEnroll::dispatch($newBulk, $userIds->toArray(), $courseIds->toArray(), $existingEnrollments, $adder);
        }

        // Enrollment::insert($bulk->toArray());
        return response()->json([
            "Message" => "Bulk Store complete",
            "data" => $test,
        ]);
    }

    public function RemoveEnrollment(Enrollment $enrollment, Request $request, UserLogService $log){
        if(!$enrollment){
            return response()->json([
                'Message' => "There is no enrollment with those credentials"
            ]);
        }
        $course = $enrollment->course;
        $enrolledUserInfos = $enrollment->enrolledUser;
        $remover = $request->user()->userInfos;

        $RecentRecords = LearnerRecentCourse::where('userInfo_id', $enrolledUserInfos->id)
                        ->where('course_id', $course->id)
                        ->get();

        $RecentRecords->each(function($record){
            $record->delete();
        });

        if($enrollment->enrollment_status === 'finished' || $enrollment->enrollment_status === 'late_finish'){
            $log->log(
                $remover->id,
                'RemovedEnrollment',
                $remover->fullName().' tried to remove '. $enrolledUserInfos->fullName().' from course '.$course->courseName,
                $request->ip(),
            );
            return response()->json([
                'Message' => 'User is already finished with their enrollment'
            ]);
        }
        $enrolledUser = $enrollment->enrolledUser->userCredentials;
        $lessonIds = $course->lessons->pluck('id');
        $attachments = $course->attachments->pluck('id');
        $enrolledUserInfos->lessons()->detach($lessonIds);
        $enrolledUserInfos->attachments()->detach($attachments);
        $courseAdmins = $enrollment->course->assignedCourseAdmins->map(function($userinfo){
            return $userinfo->userCredentials;
        });
        $enrollment->delete();
        $log->log(
            $remover->id,
            'RemovedEnrollment',
            $remover->fullName().' has removed the enrollment of '. $enrolledUserInfos->fullName().' from course '.$course->courseName,
            $request->ip(),
        );

        $enrolledUser->notify(new RemovedFromCourse($course, $remover));
        Notification::send($courseAdmins, new LearnerRemovedFromCourse($course, $remover->fullName(), $enrolledUserInfos->fullName()));

        return response()->json([
            "Message" => "successfully deleted enrollment"
        ]);
    }

    public function extendEnrollment(Enrollment $enrollment, MoveEnrollmentEndDateRequest $request, UserLogService $log){
        $validated = $request->validated();
        $course = $enrollment->course;
        $user = $enrollment->enrolledUser;
        $courseAdmin = $request->user()->userInfos;
        if(Carbon::parse($enrollment->end_date)> Carbon::parse($validated['end_date'])){
            $log->log(
            $courseAdmin->id,
            'ExtendEnrollment',
            $courseAdmin->fullName().' has extended the deadline of '. $user.' to course '. $course->courseName.' from '. $enrollment->end_date.' to '.$validated['end_date'],
            $request->ip(),
        );
            return response()->json([
                'Message' => 'Failed to extend deadline of enrollment'
            ]);
        }
        $enrollment->update($validated);
        $oldDeadline = $enrollment->end_date;
        $enrollment->refresh();
        if($enrollment->enrollment_status === 'finished' || $enrollment->enrollment_status === 'late_finish'){
            return response()->json([
                "Message" => "User already finished enrollment"
            ]);
        }
        if(Carbon::parse($enrollment->end_date)>now()->addDays(3)){
            $enrollment->update(['enrollment_status' => 'ongoing']);
        }
        $newDeadline = $enrollment->end_date;
        $usercred = $enrollment->enrolledUser->userCredentials;

        $log->log(
            $courseAdmin->id,
            'ExtendEnrollment',
            $courseAdmin->fullName().' has extended the deadline of '. $user.' to course '. $course->courseName.' from '. $oldDeadline.' to '. $newDeadline,
            $request->ip(),
        );
        $usercred->notify(new MoveEnrollmentDeadlineNotification($course, $courseAdmin->fullName(), $enrollment->end_date));


        return response()->json([
            'Message' => 'End date of enrollment has been moved'
        ]);
    }

    public function AlertLearners(Course $course, Request $request, UserLogService $log){
        $learnerCreds = $course->enrolledUsers()
                        ->whereIn('enrollment_status', ['ongoing', 'enrolled', 'due-soon'])
                        ->get()
                        ->map(function($infos){
                            return $infos->userCredentials;
                        });

        $alerter = $request->user()->userInfos;
        $log->log(
            $alerter->id,
            'AlertLearners',
            $alerter->fullName().' has alerted the learners of course '. $course->courseName,
            $request->ip(),
        );

        Notification::send($learnerCreds, new RemindUsersNotification($alerter, $course));
    }


    //Fetch Learners
    //The role names are inside of 2D array []["role_name"] to get role name
    public function enrolees(Request $request){

        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page

        $learner = UserInfos::with('roles', 'department', 'title', 'city', 'branch')->paginate($perPage);
        Log::info($learner);
        return response()->json([
            'singlea' => $learner->items(),
            'total' => $learner->total(),
            'lastPage' => $learner->lastPage(),
            'currentPage' => $learner->currentPage()
        ],200);
    }

}
