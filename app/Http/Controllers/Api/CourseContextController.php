<?php

namespace App\Http\Controllers\Api;

use App\Events\LearnerProgressUpdate;
use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Category_Course;
use App\Models\City;
use App\Models\Course;
use App\Models\Department;
use App\Models\Division;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Training_Mode;
use App\Models\Type;
use App\Models\User_Test_Attempt;
use App\Models\UserInfos;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class CourseContextController extends Controller
{
    public function index(){
        if(!Cache::has('course_context')){
            $inputs = Cache::remember('course_context', now()->addMinutes(60), function () {
                return [
                    'coursetypes' => Type::all(),
                    'coursecategories' => Category::all(),
                    'departments' => Department::all(),
                    'cities' => City::all(),
                    'branches' => Branch::all(),
                    'divisions' => Division::all(),
                    'sections' => Section::all(),
                ];
            });
            return response()->json($inputs);
        }
        $inputs = Cache::get('course_context');

        return response()->json($inputs);
    }

    public function getSelectedCourse($id, UserInfos $userInfos){
        $isEnrolled = Enrollment::where('user_id', $userInfos->id)->where('course_id', $id)->exists();

        if(!$isEnrolled){
            return response()->json(['message' => 'You are not enrolled in this course'], 403);
        };

        $course = Course::with('lessons', 'attachments', 'tests', 'tests.questions','categories','career_level', 'author', 'author.userCredentials')->find($id);
        $enrollment = Enrollment::where('user_id', $userInfos->id)->where('course_id', $course->id)->latest()->first();
        $course->modules_count = $course->modulesCount();
        $course->doneModules = $userInfos->moduleCompleted($course->id, $enrollment->id);
        $course->enrollmentStatus = Enrollment::query()
                    ->where('user_id', '=', $userInfos->id)
                    ->where('course_id', '=', $course->id)
                    ->pluck('enrollment_status')
                    ->first();
        $course->deadline = Enrollment::query()
                    ->where('user_id', '=', $userInfos->id)
                    ->where('course_id', '=', $course->id)
                    ->pluck('end_date')
                    ->first();
        foreach($course->tests as $test){
            $attemptcounter = User_Test_Attempt::query()->where('user_id', $userInfos->id)->where('test_id', $test->id)->count();
            $test->attempts = $attemptcounter;
        }
        // $course->completed_count = $userInfos->lessons()->where('course_id', $id)->wherePivot('is_completed', true)->count();
        // $course->completed_lessons = $userInfos->lessons()->where('course_id', $id)->wherePivot('is_completed', true)->pluck('lessons.id');
        // $course->adder->load(['branch', 'department', 'branch.city', 'title']);
        // $course->assignedCourseAdmins->load(['branch', 'department', 'branch.city', 'title']);
        //$main = $course->adder()->with(['branch', 'department', 'branch.city', 'title'])->get();
        if ($course) {
            return response()->json(CourseResource::make($course));
        } else {
            return response()->json(['message' => 'Course not found'], 404);
        }
    }


    public function getProgress($id, UserInfos $userInfos){
        $course = Course::find($id)->lessons();
        $course->completed_count = $userInfos->lessons()->where('course_id', $id)->wherePivot('is_completed', true)->count();
        $course->completed_lessons = $userInfos->lessons()->where('course_id', $id)->wherePivot('is_completed', true)->pluck('lessons.id');
        return response()->json([
            'completed_count' => $course->completed_count,
            'completed_lessons' => $course->completed_lessons
        ]);
    }


        public function adminGetSelectedCourse($id){
        $course = Course::with('lessons', 'attachments', 'tests', 'tests.questions','categories','career_level', 'author', 'author.userCredentials', 'archival')->find($id);

        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };

        if($course->archival->isNotEmpty()){
            $latestArchival = $course->archival->sortByDesc('WillArchiveAt')->first();
            $course->archival_date = $latestArchival;
        }

        //$main = $course->adder()->with(['branch', 'department', 'branch.city', 'title'])->get();
        if ($course) {
            return response()->json($course);
        } else {
            return response()->json(['message' => 'Course not found'], 404);
        }
    }

    public function handleProgress($userInfo, $type, $item_id, $course_id){
        $user = UserInfos::find($userInfo);
        $enrollment = Enrollment::where('course_id', $course_id)->where('user_id', $userInfo)->latest()->first(); //latest because when retaking, failed enrollment is removed

        switch($type){
            case 'lesson':
                $user->lessons()->updateExistingPivot($item_id, ['is_completed' => true, 'enrollment_id' => $enrollment->id]);
                break;
            case 'file' :
                $user->attachments()->updateExistingPivot($item_id, ['is_completed' => true, 'enrollment_id' => $enrollment->id]);
                break;
            case 'video' :
                $user->attachments()->updateExistingPivot($item_id, ['is_completed' => true, 'enrollment_id' => $enrollment->id]);
                break;
            case 'assessment' :
                $user->tests()->updateExistingPivot($item_id, ['is_completed' => true, 'enrollment_id' => $enrollment->id]);
                break;
            default:
                return response()->json([
                    'message' => 'Invalid type'
                ], 400);
        }

        //Counts
        $totalLessons = $user->lessons()->wherePivot('enrollment_id', $enrollment->id)->count();
        $totalTests = $user->tests()->wherePivot('enrollment_id', $enrollment->id)->count();
        $totalAttachment = $user->attachments()->wherePivot('enrollment_id', $enrollment->id)->count();

        //Total
        $cLessons = $user->lessons()->wherePivot('is_completed', true)->wherePivot('enrollment_id', $enrollment->id)->count();
        $cTests = $user->tests()->wherePivot('is_completed',true)->wherePivot('enrollment_id', $enrollment->id)->count();
        $cAttachment = $user->attachments()->wherePivot('is_completed', true)->wherePivot('enrollment_id', $enrollment->id)->count();


        // $cacheKey = "progress_update_{$user->id}_{$course_id}";
        // if(!cache()->has($cacheKey)){
        //     cache()->put($cacheKey, true, now()->addSeconds(3));
        // }
        $course = Course::find($course_id);
        $modulesCount = $course->modulesCount();
        $enrollment = Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->first();
        $completedCount = $user->completedModules($course_id);

        LearnerProgressUpdate::dispatch($user, $course, $modulesCount, $completedCount);

        return response()->json([
            'message' => 'Progress Updated',
            'Total' => $totalLessons + $totalTests + $totalAttachment,
            'Completed' => $cLessons + $cAttachment + $cTests]);
    }
}
