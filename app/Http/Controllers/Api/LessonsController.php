<?php

namespace App\Http\Controllers\Api;

use App\Events\LearnerProgressUpdate;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLessonsRequest;
use App\Http\Requests\UpdateLessonsRequest;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\UserInfos;

class LessonsController extends Controller
{

    public function updateLearnerProgress(UserInfos $userId, Lesson $lessonId ,$course_id)
    {
        //user course completion check
        $courseStatus = $userId->enrollments()->where('course_id', $course_id)->select(['enrollment_status',])->first();
        if ($courseStatus->enrollment_status === 'enrolled') {
            $updateStatus = $userId->enrollments()->where('course_id', $course_id)->update(['enrollment_status' => 'ongoing']);
        }

        if ($userId->lessons()->wherePivot('lesson_id', $lessonId->id)->where('is_completed', true)->exists()) {
            return response()->json(['message' => 'Lesson already completed'], 400);
        }
        $userId->lessons()->updateExistingPivot($lessonId->id, ['is_completed' => true]);
        LearnerProgressUpdate::dispatch($userId, $lessonId);


        return response()->json([
            'message' => 'Course status retrieved successfully',
            'course_status' => $courseStatus,
        ]);
    }



    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lessons)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLessonsRequest $request, Lesson $lessons)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lesson $lessons)
    {
        //
    }
}
