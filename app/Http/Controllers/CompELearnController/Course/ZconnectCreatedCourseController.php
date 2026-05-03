<?php

namespace App\Http\Controllers\CompELearnController\Course;

use App\Events\PublishCourse;
use App\Jobs\SendDistributorNotification;
use App\Jobs\NotifyAllCourseAdmins;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\UserInfos;
use App\Models\ZCompELearnCourseViewer;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnTest;
use App\Models\ZCompELearnUserReports;
use App\Models\ZCompELearnAttachment;
use App\Notifications\ZConnectDistributeCourseNotification;
use App\Models\ZCompELearnNotificationMessage;
use App\Events\CompELearnEvent\ViewerAssign;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ZconnectCreatedCourseController extends Controller
{
           
    public function index()
    {
        $user = Auth::user()->load('userInfos');

        $courses = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)
            ->where(function($query) {
                $query->whereIn('CourseStatus', ['created', 'ondevelopment', 'for_approval'])
                    ->orWhere(function($query) {
                        $query->where('CourseStatus', 'reviewed')
                            ->whereHas('courseReview', function($q) {
                                $q->where('approval_status', 'rejected');
                            });
                    });
            })
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'certificates:id,course_id', 'courseReview'])
            ->withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($courses, 200);
    }

    public function sharedCourses()
    {
        $user = Auth::user()->load('userInfos');
        $userInfoId = $user->userInfos->id;

        $sharedCourses = ZCompELearnCreatedCourse::whereHas('smePermitted', function($query) use ($userInfoId) {
            $query->where('PermittedID', $userInfoId);
        })
        ->where(function($query) {
            $query->whereIn('CourseStatus', ['created', 'ondevelopment', 'for_approval'])
                ->orWhere(function($query) {
                    $query->where('CourseStatus', 'reviewed')
                        ->whereHas('courseReview', function($q) {
                            $q->where('approval_status', 'rejected');
                        });
                });
        })
        ->with(['division', 'careerLevel', 'category', 'userInfo', 'certificates:id,course_id', 'courseReview'])
        ->withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($sharedCourses, 200);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'CourseName' => 'required|string|max:255',
            'Overview' => 'nullable|string',
            'Objective' => 'nullable|string',
            'TrainingType' => 'required|string|max:255',
            'CourseStatus' => 'required|in:created,ondeveleopment,draft,published,archived',
            'career_level_id' => 'required|exists:career_levels,id',
            'category_id' => 'required|exists:categories,id',
            'user_info_id' => 'required|exists:userInfo,id',
            'Division' => 'required|string|max:255',
        ]);

        do {
            $courseID = 'CR-' . rand(100000, 999999);
            $exists = ZCompELearnCreatedCourse::where('CourseID', $courseID)->exists();
        } while ($exists);

        $validated['CourseID'] = $courseID;

        $course = ZCompELearnCreatedCourse::create($validated);

        do {
            $certificateName = 'CERT-' . rand(10000000, 99999999);
            $existsCert = $course->certificates()->where('CertificateName', $certificateName)->exists();
        } while ($existsCert);

        $course->certificates()->create([
            'CertificateName' => $certificateName,
        ]);

        ZCompELearnUserReports::create([
            'user_info_id' => $validated['user_info_id'],
            'Action' => 'Created Course',
            'Details' => [
                'CourseID' => $courseID,
                'Course Name' => $validated['CourseName'],
                'Training Type' => $validated['TrainingType'],
                'Course Status' => $validated['CourseStatus'],
                'Division' => $validated['Division'],
            ],
        ]);

        return response()->json($course, 201);
    }



    public function course($id)
    {
        $course = ZCompELearnCreatedCourse::withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'userInfo.userCredentials', 'certificates:id,course_id', 'courseReview', 'certificates.creditors', 'smePermitted.user'])
            ->find($id);

        if (empty($course)) {
            return response()->json(['message' => 'Course not found'], 404);
        }
    
        $uniqueUsers = $course->smePermitted->pluck('user')->unique('id')->values();
        $course->setRelation('smePermitted', $uniqueUsers);

        return response()->json($course, 200);
    }

    public function setCourseDraft($courseId){
        $course = ZCompELearnCreatedCourse::find($courseId);

        $course->CourseStatus = 'draft';
        $course->save();

        return response()->json(['message' => 'Course status updated to draft'], 200);
    }

    public function getDraftedCourses() {
        $user = Auth::user()->load('userInfos');

        $draftedCourses = ZCompELearnCreatedCourse::
            where('CourseStatus', 'draft')
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'userInfo.userCredentials'])
            ->get();

        return response()->json($draftedCourses, 200);
    }

    public function setReviewed($courseId){
        $course = ZCompELearnCreatedCourse::find($courseId);

        $course->CourseStatus = 'reviewed';
        $course->save();

        return response()->json(['message' => 'Course status updated to reviewed'], 200);
    }

    public function getReviewedCourses(){
        $user = Auth::user()->load('userInfos');

        $reviewedCourses = ZCompELearnCreatedCourse::
            where('CourseStatus', 'reviewed')
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'userInfo.userCredentials'])
            ->get();

        return response()->json($reviewedCourses, 200);
    }

    public function setCoursePublished($courseId)
    {
        $user = auth()->user()->load(['userInfos', 'roles']);
        $userInfos = $user->userInfos;

        // $assignerName = trim("{$userInfos->first_name} {$userInfos->middle_name} {$userInfos->last_name}");
        if ($userInfos->name_suffix) {
            $assignerName .= ' ' . $userInfos->name_suffix;
        }

        $course = ZCompELearnCreatedCourse::find($courseId);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $approve = !ZCompELearnCourseViewer::where('course_id', $courseId)
                    ->where('approval_status', 'rejected')
                    ->exists();

        if (!$approve) {
            return response()->json([
                'message' => 'Cannot publish course. One or more reviewers have rejected the course.'
            ], 400);
        }

        $course->CourseStatus = 'published';
        $course->save();

        PublishCourse::dispatch($course, $userInfos);

        return response()->json([
            'message' => 'Course published successfully. Mirror creation is queued.'
        ], 200);
    }


    public function getPublishedCourses($categoryId) {

        $publishedCourses = ZCompELearnCreatedCourse::
            where('CourseStatus', 'published')
            ->where('category_id', $categoryId)
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'userInfo.userCredentials'])
            ->get()
            ->map(function($course){
                $mblearn = Course::where('courseID', '=', $course->CourseID)->first();
                $course->mblearnID = $mblearn?->id;
                return $course;
            });

        return response()->json($publishedCourses, 200);
    }


    public function getCourseDevelopment($id){
        $course = ZCompELearnCreatedCourse::find($id);

       $modules = $course->lessons()->count();
       $attachments = $course->attachments()->count();
       $test = $course->tests()->count();
       $hasObj = !empty($course->Objective);
       $hasOverview = !empty($course->Overview);

        return response()->json([
            'modules' => $modules + $attachments,
            'tests' => $test,
            'certificates' => 0,
            'objective' => $hasObj,
            'overview' => $hasOverview
        ], 200);
    }

    public function getCourseByStatus($status)
    {
        $user = Auth::user()->load('userInfos.roles');
        $roles = $user->userInfos->roles->pluck('role_name')->toArray();

        if (in_array('SME-Creator', $roles)) {
            $query = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id);

            if ($status !== 'all') {
                $query->where('CourseStatus', $status);
            } else {
                $query->whereNotIn('CourseStatus', ['deleted', 'archived']);
            }

            $courses = $query
                ->with(['division', 'careerLevel', 'category', 'userInfo', 'courseReview', 'retentionSettings'])
                ->withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
                ->get();

            return response()->json($courses, 200);
        }

        if (in_array('SME-Approver', $roles)) {
            $query = ZCompELearnCourseViewer::where('user_info_id', $user->userInfos->id);

            if ($status === 'rejected') {
                $query->where('approval_status', 'rejected')
                    ->where('user_info_id', $user->userInfos->id);
            } elseif ($status === 'approved') {
                $query->where('approval_status', 'approved')
                    ->where('user_info_id', $user->userInfos->id)
                    ->whereHas('course', function ($courseQuery) {
                        $courseQuery->where('CourseStatus', '!=', 'published');
                    });
            } elseif ($status === 'published') {
                $query->where('approval_status', 'approved')
                    ->whereHas('course', function ($courseQuery) {
                        $courseQuery->where('CourseStatus', 'published');
                    });
            } elseif ($status === 'pending') {
                $query->where('approval_status', $status)
                    ->where('user_info_id', $user->userInfos->id);
            } else {
                $query->where('approval_status', $status);
            }

            $viewerCourses = $query->with(['course.division', 'course.careerLevel', 'course.category', 'course.userInfo', 'course.courseReview'])->get();

            $courses = $viewerCourses->map(fn ($vc) => $vc->course);

            return response()->json($courses, 200);
        }

        if (in_array('SME-Distributor', $roles)) {
            if ($status === 'published') {
                $courses = ZCompELearnCreatedCourse::where('CourseStatus', 'published')
                    ->with(['division', 'careerLevel', 'category', 'userInfo', 'courseReview'])
                    ->get();

                return response()->json($courses, 200);

            } elseif ($status === 'distributed') {
                $distributedCourses = ZCompELearnCreatedCourse::where('CourseStatus', 'distributed')
                    ->with(['division', 'careerLevel', 'category', 'userInfo', 'courseReview'])
                    ->get();

                return response()->json($distributedCourses, 200);
            } elseif ($status === 'inactive') {
                $inactiveCourses = ZCompELearnCreatedCourse::where('CourseStatus', 'inactive')
                    ->with(['division', 'careerLevel', 'category', 'userInfo', 'courseReview'])
                    ->get();

                return response()->json($inactiveCourses, 200);
            } else {
                return response()->json([], 200);
            }
        }

        return response()->json(['error' => 'Unauthorized'], 403);
    }

    public function submitForReApproval($courseId)
    {
        $course = ZCompELearnCreatedCourse::findOrFail($courseId);

        if ($course->CourseStatus === 'for_approval') {
            return response()->json(['message' => 'Course is already under review.'], 400);
        }

        $course->CourseStatus = 'for_approval';
        $course->save();

        return response()->json(['message' => 'Course submitted for re-approval.']);
    }



    // For editing Certificate
    public function show() {

        $pdf = Pdf::loadView('certificate.template', ['name' => 'John Doe', 'course' => 'Laravel Basics'])
                    ->setPaper('letter', 'landscape');


        return $pdf->stream('certificate.pdf');
    }


}
