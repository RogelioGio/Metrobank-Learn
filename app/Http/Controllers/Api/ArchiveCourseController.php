<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssignedCourseAdminNotify;
use App\Models\Course;
use App\Notifications\NotifyCourseAdminsRejected;
use App\Notifications\NotifyDistributorRejected;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ArchiveCourseController extends Controller
{
    public function rejectArchival(AssignedCourseAdminNotify $assign, Request $request){
        $course = $assign->course;
        if($course->status === 'active'){
            return response()->json([
                'message' => 'Course is already active'
            ]);
        }
        if($course->status === "archive"){
            return response()->json([
                'message' => 'Course is already archived'
            ]);
        }

        $course->update(['status' => 'active']);
        AssignedCourseAdminNotify::where('course_id', $course->id)->delete();
        $distributorCreds = $assign->distributor->userCredentials;
        $courseAdminCreds = $assign->course->assignedCourseAdmins->map(fn($info) => $info->userCredentials);
        $rejector = $request->user()->userInfos;
        $distributorCreds->notify(new NotifyDistributorRejected($rejector, $course, $assign));
        Notification::send($courseAdminCreds, new NotifyCourseAdminsRejected($rejector, $course, $assign));

        return response()->json([
            'message' => 'The archival of this course was rejected'
        ]);
    }
}
