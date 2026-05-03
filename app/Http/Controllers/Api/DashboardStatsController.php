<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardStatsController extends Controller
{


public function completionRates(Course $course, Request $request){
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $division_id = $request->input('division_id');
    $department_id = $request->input('department_id');

    // Start query for enrollments via pivot
    $enrollmentQuery = Enrollment::where('course_id', $course->id)
        ->with(['enrolledUser', 'enrolledUser.title.department.division', 'enrolledUser.career_level'])
        ->whereIn('enrollment_status', ['finished', 'late_finish', 'failed']);

    // Date filter (start_date or end_date within range)
    if ($start_date && $end_date) {
        $enrollmentQuery->where(function($q) use ($start_date, $end_date){
            $q->whereBetween('start_date', [$start_date, $end_date])
              ->orWhereBetween('end_date', [$start_date, $end_date]);
        });
    }

    // Division filter
    if ($division_id) {
        $enrollmentQuery->whereHas('enrolledUser.division', function($q) use ($division_id){
            $q->where('division_id', $division_id);
        });
    }

    // Department filter
    if ($department_id) {
        $enrollmentQuery->whereHas('enrolledUser.department', function($q) use ($department_id){
            $q->where('department_id', $department_id);
        });
    }

    $enrollments = $enrollmentQuery->get();

    // Compute counts
    $passedCount = $enrollments->where('enrollment_status', 'finished')->count();
    $failedCount = $enrollments->where('enrollment_status', 'failed')->count();
    $onTimeCount = $enrollments->where('enrollment_status', 'finished')
        ->filter(fn($e) => Carbon::parse($e->updated_at)->lessThanOrEqualTo(Carbon::parse($e->end_date)))
        ->count();
    $lateCount = $enrollments->where('enrollment_status', 'late_finish')->count();

    return response()->json([
        "enrollments" => $enrollments,
        'total_learners' => $enrollments->count(),
        'finished_learners' => $enrollments->count(),
        'passed_count' => $passedCount,
        'failed_count' => $failedCount,
        'on_time' => $onTimeCount,
        'late' => $lateCount,
    ]);
}

    public function onTimeNotOnTime(Course $course, Request $request){
        $learners = $course->enrolledUsers;
        $onTime = $learners->whereIn('pivot.enrollment_status', ['finished', 'failed']);

        $notOnTime = $learners->whereIn('pivot.enrollment_status', ['late_finish']);

        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        if($start_date && $end_date){
            $onTime = $onTime->where('pivot.start_date', '>=', $start_date)->where('pivot.start_date', '<=', $end_date);
            $notOnTime = $notOnTime->where('pivot.start_date', '>=', $start_date)->where('pivot.start_date', '<=', $end_date);
        }

        return response()->json([
            'on_time' => $onTime->count(),
            'not_on_time' => $notOnTime->count(),
        ]);
    }

    public function totalLearners(Course $course){
        $count = $course->enrolledUsers()->count();

        return response()->json([
            'Total_learners' => $count,
        ]);
    }

    public function EnrollmentStatusPerDay(Course $course, Request $request){
        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $statusQuery = $course->enrollmentstatuscount();

        if($start_date){
            $statusQuery->where('recorded_at', '>', $start_date);
        }
        if($end_date){
            $statusQuery->where('recorded_at', '<', $end_date);
        }

        $statuses = $statusQuery->get();

        $statuses = $statuses->map(function($status){
            $output = [
                'date' => $status->recorded_at,
                'enrolled_count' => $status->enrolled_count,
                'ongoing_count' => $status->ongoing_count,
                'finished_count' => $status->finished_count,
                'past-due_count' => $status->past_due_count,
            ];

            return $output;
        });

        return $statuses;
    }

    public function getLearnerEngagement(Course $course, Request $request){
        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $engagementQuery = $course->learnerengagement();

        if($start_date){
            $engagementQuery->where('recorded_at', '>=', $start_date);
        }
        if($end_date){
            $engagementQuery->where('recorded_at', '<=', $end_date);
        }

        $engagement = $engagementQuery->select('recorded_at', DB::raw('COUNT(*) as total'))->groupBy('recorded_at')->get();
        $engagement = $engagement->map(function($engage){
            $output = [
                'date' => $engage->recorded_at,
                'learner_engagement_count' => $engage->total,
            ];

            return $output;
        });

        return $engagement;
    }

    public function CourseTimeline(Course $course, Request $request){
        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $division_id = $request->input('division_id');
        $department_id = $request->input('department_id');

        $userQuery = $course->enrollments()->with(['enrolledUser', 'enrolledUser.title.department.division'])
        ->whereIn('enrollment_status', ['enrolled', 'ongoing', 'past-due', 'due-soon']);

        if($start_date && $end_date){
            $userQuery->where(function($q)use ($start_date, $end_date){
                $q->whereBetween('start_date', [
                    $start_date,
                    $end_date,
                ])
                ->orWhereBetween('end_date', [
                    $start_date,
                    $end_date,
                ]);
            });
        }
        if($division_id){
            $userQuery->whereHas('enrolledUser.division', function($q) use($division_id){
                $q->where('division_id', $division_id);
            });
        }
        if($department_id){
            $userQuery->whereHas('enrolledUser.department', function($q) use ($department_id){
                $q->where('department_id', $department_id);
            });
        }

        $enrollment = $userQuery->get();

        return response()->json([
            "enrollments" => $enrollment,
            "enrolled_count" => $enrollment->where('enrollment_status', 'enrolled')->count(),
            "ongoing_count" => $enrollment->where('enrollment_status', 'ongoing')->count(),
            "past_due_count" => $enrollment->where('enrollment_status', 'past-due')->count(),
            "due_soon_count" => $enrollment->where('enrollment_status', 'due-soon')->count(),
        ]);
    }
}
