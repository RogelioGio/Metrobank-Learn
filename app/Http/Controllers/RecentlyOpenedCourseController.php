<?php

namespace App\Http\Controllers;

use App\helpers\LessonCountHelper;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearnerEngagement;
use App\Models\LearnerRecentCourse;
use App\Models\RecentlyOpenedCourse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecentlyOpenedCourseController extends Controller
{
    public function record($course)
    {
        $user = Auth::user()->load('userInfos');
        $course = Course::findOrFail($course);

        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };

        // Log the recently opened course
        RecentlyOpenedCourse::updateOrCreate(
            [
                'user_info_id' => $user->userInfos->id,
                'course_id' => $course->id,
            ],
            [
                'last_opened_at' => now(),
            ]
            );
        return response()->json(['message' => 'Course opened logged successfully.'], 200);
    }

    public function learnerRecord($course){
        $user = Auth::user()->load('userInfos');
        $course = Course::findOrFail($course);

        $isEnrolled = Enrollment::where('user_id', $user->userInfos->id)->where('course_id', $course->id)->exists();
        if(!$isEnrolled){
            return response()->json(['message' => 'You are not enrolled in this course'], 403);
        };

        // Log the recently opened course
        LearnerRecentCourse::updateOrCreate(
            [
                'userInfo_id' => $user->userInfos->id,
                'course_id' => $course->id,
            ],
            [
                'last_opened_at' => now(),
            ]
            );

        $todayEngagement = LearnerEngagement::where('user_id', $user->userInfos->id)->where('course_id', $course->id)->where('recorded_at', now()->toDateString())->exists();
        if(!$todayEngagement){
            LearnerEngagement::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'recorded_at' => now(),
            ]);
        }
        return response()->json(['message' => 'Course opened logged successfully.'], 200);
    }

    public function getRecent(Request $request) {
        $user = Auth::user()->load('userInfos');

        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 4);

        // $courses = RecentlyOpenedCourse::with('course', 'course.category', 'course.careerLevel',) // Eager load the course relationship
        // ->where('user_info_id', $user->userInfos->id)
        // ->orderBy('last_opened_at', 'desc')
        // ->take(12)
        // ->get();

        $courses = Course::with(['categories', 'lessons', 'attachments', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials','archival'])
        ->whereHas('recentlyOpenedCourses', function ($query) use ($user) {
            $query->where('user_info_id', $user->userInfos->id);
        })
        ->orderByDesc('updated_at')
        ->take(12)
        ->paginate($perPage);

        foreach ($courses as $course) {
            if ($course->archival->isNotEmpty()) {
                $latestArchival = $course->archival->sortByDesc('WillArchiveAt')->first();
                $course->archival_date = $latestArchival;
            } else {
                $course->archival_date = null;
            }
        }

        $courses = LessonCountHelper::getEnrollmentStatusCount($courses);
        $courses = CourseResource::collection($courses);

        return response()->json([
            'data' => $courses->items(),
            'total' => $courses->total(),
            'current_page' => $courses->currentPage(),
            'last_page' => $courses->lastPage(),
            'per_page' => $courses->perPage(),
        ]);
    }

    public function getRecentOpenedCoursesLearner(Request $request)
    {
        $user = Auth::user()->load('userInfos');
        $userInfos = $user->userInfos;

        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 4);

        $courses = Course::with(['categories', 'lessons', 'attachments', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])
        ->whereHas('recentLearnerCourses', function ($query) use ($user) {
            $query->where('userInfo_id', $user->userInfos->id);
        })
        ->orderByDesc('updated_at')
        ->take(12)
        ->paginate($perPage);
        foreach($courses as $course){
            if($course->lessonCount() > 0){
                $course->progress = round($userInfos->completedModules($course->id)/$course->modulesCount() * 100, 2);
            }else{
                $course->progress = 0;
            }
            $enrollment = Enrollment::query()
                ->where('user_id', '=', $userInfos->id)
                ->where('course_id', '=', $course->id)
                ->first();
            $course->deadline = $enrollment->end_date;
            $course->doneModules = $userInfos->moduleCompleted($course->id, $enrollment->id);
            $course->enrollmentStatus = $enrollment->enrollment_status;
            $course->modules = $course->modulesCount();
        }
        $courses->makeHidden(['enrollments']);
        LessonCountHelper::getEnrollmentStatusCount($courses);
        $courses = CourseResource::collection($courses);

        return response() -> json([
                'data' => $courses->items(),
                'total' => $courses->total(),
                'lastPage' => $courses->lastPage(),
                'currentPage' => $courses->currentPage(),
            ]);

    }
}
