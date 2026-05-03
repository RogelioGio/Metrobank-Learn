<?php

namespace App\Http\Controllers\Api;

use App\Filters\UserInfosFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveSelfEnrollmentRequest;
use App\Http\Requests\SelfEnrollRequest;
use App\Http\Resources\UserInfoResource;
use App\Jobs\ApproveSelfEnrollments;
use App\Jobs\BulkSelfEnroll;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\SelfEnrollmentRequest;
use App\Models\UserInfos;
use App\Notifications\NotifyCourseAdminsForApproval;
use App\Notifications\NotifyCourseAdminsSelfEnrollmentApproved;
use App\Notifications\NotifyUserSelfEnrollmentRejected;
use App\Notifications\SelfEnrollmentRequestUpdate;
use App\Services\UserLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class SelfEnrollmentController extends Controller
{
    public function selfEnroll(SelfEnrollRequest $request, UserLogService $log){
        $bulk = $request->validated();
        $user = $request->user()->load('userInfos');

        $userId = $user->userInfos->id;
        $courseIds = collect($bulk)->pluck('course_id')->unique();

        $userInfo = $user->userInfos;
        $courses = Course::whereIn('id', $courseIds)->get()->keyBy('id');

        $existingSelfEnrollRequests = SelfEnrollmentRequest::where('user_id', $userId)
                                        ->whereIn('course_id', $courseIds)
                                        ->get()
                                        ->map(fn($e) => $e->user_id.'-'.$e->course_id)
                                        ->toArray();

        $existingEnrollment = Enrollment::where('user_id', $userId)
                                ->whereIn('course_id', $courseIds)
                                ->get()
                                ->map(fn($e) => $e->user_id.'-'.$e->course_id)
                                ->toArray();
        $errors = [];
        $courseNames = [];
        BulkSelfEnroll::dispatch($bulk, $existingSelfEnrollRequests, $existingEnrollment, $courses, $user);
        foreach($bulk as $single){
            $key = $userId.'-'.$single['course_id'];

            if(in_array($key, $existingSelfEnrollRequests)){
                $errors[] = ["Message" => $userId." has already requested {$single['course_id']}"];
                continue;
            }
            if(in_array($key, $existingEnrollment)){
                $errors[] = ["Message" => $userId." is already enrolled in {$single['course_id']}"];
                continue;
            }
            $courseNames[] = $courses[$single['course_id']];
        }
        $courseNamess = collect($courseNames)->map(function($course){
            return $course->courseName;
        });
        $course = $courseNames[0];
        $courseAdmins = $courseNames[0]->assignedCourseAdmins;
        $courseAdminsCreds = $courseAdmins->map(function($info){
            return $info->userCredentials;
        });
        Notification::send($courseAdmins, new NotifyCourseAdminsForApproval($course, $user->userInfos));
        $log->log(
            $userId,
            'SelfEnrollmentRequest',
            $user->userInfos->fullName().' requested to be enrolled in '. $courseNamess,
            $request->ip(),
        );

        return response()->json([
            "Message" => "In queue",
        ]);
    }

    public function CourseSelfEnrollmnentRequests(Course $course, Request $request){
        $perPage = $request->input('per_page', 5);
        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);

        $query = $course->selfEnrollRequests()->where('status', 'pending')
                    ->whereHas('user', function($q) use($queryItems){
                        $q->mergeConstraintsFrom($queryItems)->where('status', 'Active')
                        ->whereNot('id', request()->user()->userInfos->id);
                    })
                    ->with(['user.roles','user.title.department.division', 'user.career_level']);

        foreach($query as $req){
            $req->start_date = $course->selfEnrollRequests()->where('status', 'pending')->select('start_date');
        }

        $requests = $query->paginate($perPage);

        $requests->getCollection()->transform(function($requested){
            $user = $requested->user;
            $user->request_id = $requested->id;
            $user->start_date = $requested->start_date;
            $user->end_date = $requested->end_date;
            return $user;
        });
        $users = UserInfoResource::collection($requests);
        return response() -> json([
            'data' => $users->items(),
            'total' => $users->total(),
            'lastPage' => $users->lastPage(),
            'currentPage' => $users->currentPage(),
        ]);
    }

    public function ResolveRequest(ResolveSelfEnrollmentRequest $request, UserLogService $log){
        $bulk = $request->validated();
        $courseAdmin = $request->user()->userInfos;
        $options = $bulk['status'];
        $selfenrollmentids = collect($bulk['list'])->pluck('request_id')->all();
        if($options === "rejected"){
            SelfEnrollmentRequest::whereIn('id', $selfenrollmentids)->where('status', 'pending')->update(['status' => $options]);
            $selfEnrollments = SelfEnrollmentRequest::whereIn('id', $selfenrollmentids)
                                                ->with('user.userCredentials', 'course')
                                                ->get();

            $learners = $selfEnrollments->pluck('user.userCredentials');
            $course = $selfEnrollments->first()->course;
            Notification::send($learners, new NotifyUserSelfEnrollmentRejected($course, $courseAdmin));
            $learnerAndCourse = $selfEnrollments->mapWithKeys(function($self){
                $user = $self->user->fullName();
                $course = $self->course->courseName;
                return [$user => $course];
            });
            $log->log(
                $courseAdmin->id,
                'RejectSelfEnrollmentRequest',
                $courseAdmin->fullName().' has rejected the following self enrollments: '.$learnerAndCourse->map(fn($course, $user) => "$user - $course")->join(', '),
                $request->ip()
            );

            return response()->json([
                'Message' => "Self enrollments rejected",
            ]);
        }
        $courseAdmin = $request->user()->userInfos;
        $selfenrollmentrequests = $bulk['list'];
        ApproveSelfEnrollments::dispatch($selfenrollmentrequests, $courseAdmin, $request->ip());
        return response()->json([
            'Message' => 'Self Enroll '.$options
        ]);
    }


    //WALA NA TO
    public function RejectRequest(SelfEnrollmentRequest $self, Request $request){
        // $self->update(['status' => 'rejected']);
        // $notify = $self->user->userCredentials;
        // $course = $self->course;
        // $approver = $request->user()->userInfos;
        // $notify->notify(new SelfEnrollmentRequestUpdate($course, 'rejected', $approver->fullName()));
    }
}
