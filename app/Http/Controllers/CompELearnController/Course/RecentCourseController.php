<?php

namespace App\Http\Controllers\CompELearnController\Course;
use App\Http\Controllers\Controller;

use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnCourseRecentOpened;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecentCourseController extends Controller
{
    //Logs the user recent opeend courses
    public function logsOpenedCourse($courseId)
    {
            $user = Auth::user()->load('userInfos');
            $course = ZCompELearnCreatedCourse::findOrFail($courseId);

            // Log the recently opened course
            ZCompELearnCourseRecentOpened::updateOrCreate(
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

    //fetch recent opened courses
    public function getRecentOpenedCourses()
    {
        $user = Auth::user()->load('userInfos');

        $courses = ZCompELearnCourseRecentOpened::with('course', 'course.category', 'course.careerLevel',) // Eager load the course relationship
        ->where('user_info_id', $user->userInfos->id)
        ->whereHas('course', function ($query) {
            $query->whereIn('CourseStatus', ['created','ondevelopment']); // Exclude archived courses
        })
        ->orderBy('last_opened_at', 'desc')
        ->take(5)
        ->get()
        ->map(function ($entry) {
                return [
                    'course_id' => $entry->course->id,
                    'CourseID' => $entry->course->CourseID,
                    'courseName' => $entry->course->CourseName,
                    'category' => $entry->course->category->category_name,
                    'careerLevel' => $entry->course->careerLevel->name . " Level",
                    'trainingType' => $entry->course->TrainingType,
                    'last_opened_at' => Carbon::parse($entry->last_opened_at)->diffForHumans(),
                ];
        });

        return response()->json($courses, 200);
    }


}


