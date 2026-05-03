<?php

namespace App\Http\Controllers\CompELearnController\Course;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Course;
use App\Models\UserInfos;
use App\Models\ZCompELearnCourse;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnLesson;
use App\Models\ZCompELearnTest;
use App\Models\ZCompELearnAttachment;
use Carbon\Carbon;
use DB;

class ZConnectDistributorController extends Controller
{
  public function fetchAssignedCourseAdmins($courseId)
  {
      $admins = CourseUserInfoAssignment::where('course_id', $courseId)
          ->whereNotNull('distributor_id')
          ->with(['distributor.userCredentials'])
          ->get()
          ->map(function ($assignment) {
              $distributor = $assignment->distributor;
              return [
                  'id' => $distributor->id,
                  'first_name' => $distributor->first_name,
                  'last_name' => $distributor->last_name,
                  'email' => $distributor->userCredentials->MBemail ?? null,
              ];
          });

      return response()->json($admins);
  }

    public function archiveCourseWithCourseAdmins(Request $request, $CourseID)
    {

        $distributor = auth()->user();
        $reason = $request->input('reason', '');
        $archivedCourses = [];

        $mblCourse = Course::where('courseID', $CourseID)->first();
        if ($mblCourse) {
            $mblCourse->status = 'for_archival';
            $mblCourse->save();

            $willArchiveAt = $request->input('WillArchiveAt') 
                ? Carbon::parse($request->input('WillArchiveAt')) 
                : now()->addDays(7);

            $courseAdmins = UserInfos::whereHas('roles', function ($query) {
                    $query->whereIn('role_name', ['Course Admin', 'System Admin']);
                })
                ->whereNot(function ($query) {
                    $query->whereHas('permissions', function ($q) {
                        $q->where('permission_name', 'Root');
                    });
                })
                ->whereHas('assignedCourses', function ($query) use ($mblCourse) {
                    $query->where('courses.id', $mblCourse->id);
                })
                ->where('status', 'Active')
                ->pluck('id');

            foreach ($courseAdmins as $courseAdminId) {
                DB::table('assigned_course_admins_notify')->updateOrInsert(
                    [
                        'CourseID' => $CourseID,
                        'DistributorID' => $distributor->id,
                        'CourseAdminID' => $courseAdminId,
                    ],
                    [
                        'course_id' => $mblCourse->id,
                        'WillArchiveAt' => $willArchiveAt,
                        'Reason' => $reason,
                        'IsRejected' => 0,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            $archivedCourses[] = 'MBLearn (pending archival)';
        }

        $compCourse = ZCompELearnCreatedCourse::where('CourseID', $CourseID)->first();
        if ($compCourse) {
            $compCourse->CourseStatus = 'inactive';
            $compCourse->ArchivedAt = now();
            $compCourse->save();
            $archivedCourses[] = 'CompELearn';
        }

        return response()->json([
            'message' => 'Course archived successfully in: ' . implode(', ', $archivedCourses),
        ]);
    }


}

