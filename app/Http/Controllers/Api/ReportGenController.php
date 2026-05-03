<?php

namespace App\Http\Controllers\Api;

use App\Filters\UserInfosFilter;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Report;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Models\UserLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DB;
use Google\Service\CloudBuild\UserCredential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Support\Facades\DB as FacadesDB;
use Illuminate\Support\Facades\Log;
use Schema;


class ReportGenController extends Controller
{
    public function generate(Request $request, $type)
    {

        $data = [];
        $pdf = null;

        switch ($type){
            case 'userList' : {
                $startDate = Carbon::parse($request->reportEntriesStartDate)->startOfDay();
                $endDate = Carbon::parse($request->reportEntriesEndDate)->endOfDay();
                $data = UserInfos::select(
                        'employeeID',
                        'first_name',
                        'last_name',
                        'middle_name',
                        'title_id',)
                        ->whereBetween('created_at', [$startDate, $endDate]);
                $filter = new UserInfosFilter();
                $filteringItems = $filter->transform($data, $request);




                // $data = UserInfos::select(
                //     'employeeID',
                //     'first_name',
                //     'last_name',
                //     'middle_name',
                //     'status',
                //     'division_id',
                //     'department_id',
                //     'section_id',
                //     'branch_id',
                //     'title_id',
                //     'created_at',
                // )
                // ->whereBetween('created_at', [$startDate, $endDate])
                // ->where($filteringItems)
                // ->with(['division','department','title','section','city','branch'])
                // ->get();
                $users = $filteringItems->with(['title.department.division'])->get();

                $genBy = $request->user_name ?? 'System Generated';
                $startscope = $request->reportEntriesStartDate;
                $endscope = $request->reportEntriesEndDate;

                if($users->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }

                $entries = $users->chunk(20);

                $pdf = Pdf::loadView('reports.template', [
                'name' => 'User Master List Report',
                'date' => now()->format('Y-m-d'),
                'genby' => $genBy,
                'scope' => $startscope && $endscope ? "From $startscope to $endscope" : 'All Users',
                'entries' => $entries,
                'usedFor' => 'userList'])->setPaper('letter', 'portrait');
                return $pdf->download("User_Master_List_Report_".now()->format('Y-m-d').".pdf");
            };
            case 'roleDistribution' : {
                $startDate = Carbon::parse($request->reportEntriesStartDate)->startOfDay();
                $endDate = Carbon::parse($request->reportEntriesEndDate)->endOfDay();
                $data = UserInfos::select(
                    'id',
                    'employeeID',
                    'first_name',
                    'last_name',
                    'middle_name',
                    'name_suffix',
                    'status',
                    'division_id',
                    'department_id',
                    'section_id',
                    'title_id',
                )
                ->whereBetween('created_at', [$startDate, $endDate]);
                $filter = new UserInfosFilter();
                $filteringItems = $filter->transform($data, $request);



                $users = $filteringItems->when(!empty($request->role_selected), function ($query) use ($request) {
                    $query->whereHas('roles', function ($q) use ($request) {
                        $q->whereIn('role_id', $request->role_selected);
                    });
                })
                ->with(['roles', 'division', 'department', 'title', 'section',])
                ->get();

                $genBy = $request->user_name ?? 'System Generated';
                $startscope = $request->reportEntriesStartDate;
                $endscope = $request->reportEntriesEndDate;

                if($users->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }

                $entries = $users->chunk(20);

                $pdf = Pdf::loadView('reports.template', [
                'name' => 'Role Distribution Report',
                'date' => now()->format('Y-m-d'),
                'genby' => $genBy,
                'scope' => $startscope && $endscope ? "From $startscope to $endscope" : 'All Users',
                'entries' => $entries,
                'usedFor' => 'roleDistribution'])->setPaper('letter', 'portrait');
                return $pdf->download("Role_Distribution_List_Report_".now()->format('Y-m-d').".pdf");
            }
            case 'accountStatus' : {
                $startscope = $request->reportEntriesStartDate;
                $endscope = $request->reportEntriesEndDate;

                $role = $request->role ?? null;
                $data = UserCredentials::select(
                    'id',
                    'MBemail',
                )->whereBetween('created_at', [
                    Carbon::parse($startscope)->startOfDay(),
                    Carbon::parse($endscope)->endOfDay()
                ])
                ->when($request->role, function ($query) use ($role) {
                    $query->whereHas('roles', function ($roleQuery) use ($role) {
                        $roleQuery->where('role_id', $role);
                    });
                })
                ->with([
                    'userInfos:id,user_credentials_id,first_name,last_name,employeeID,status',
                    'roles:roles.id,roles.role_name'
                ])->get();

                $genBy = $request->user_name ?? 'System Generated';

                if($data->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }

                $entries = $data->chunk(20);

                $pdf = Pdf::loadView('reports.template', [
                'name' => 'Accounts Status Report',
                'date' => now()->format('Y-m-d'),
                'genby' => $genBy,
                'scope' => $startscope && $endscope ? "From $startscope to $endscope" : 'All Users',
                'entries' => $entries,
                'usedFor' => 'accountStatus'])->setPaper('letter', 'portrait');
                return $pdf->download("Accounts_Status_List_Report_".now()->format('Y-m-d').".pdf");
            }
            case 'userLogs' : {
                $employee = UserInfos::with(['userCredentials','roles','title'])->find($request->id);
                $startDate = Carbon::parse($request->reportEntriesStartDate)->startOfDay();
                $endDate = Carbon::parse($request->reportEntriesEndDate)->endOfDay();
                $data = UserLog::select(
                    'log_type',
                    'log_description',
                    'log_timestamp'
                )
                ->where('user_infos_id', $request->id)
                ->whereBetween('created_at', [$startDate, $endDate])->get();

                $entries = $data->chunk(20);

                $genBy = $request->user_name ?? 'System Generated';
                $startscope = $request->reportEntriesStartDate;
                $endscope = $request->reportEntriesEndDate;

                if($data->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }
                $pdf = Pdf::loadView('reports.template', [
                'name' => 'User Log Report',
                'date' => now()->format('Y-m-d'),
                'genby' => $genBy,
                'scope' => $startscope && $endscope ? "From $startscope to $endscope" : 'All action of the user',
                'entries' => $entries,
                'employee' => $employee,
                'usedFor' => 'userLogs'])->setPaper('letter', 'portrait');
                return $pdf->download("UserLog_".$employee->employeeID.".pdf");
                // return response()->json([
                //     "employee" => $employee,
                //     "entries" => $data,
                // ], 200);
            }
            case 'coursePerformance' : {
                $course = Course::with(['categories','author','career_level'])
                    ->find($request->course_id);

                $start = Carbon::parse($request->reportEntriesStartDate)->startOfDay();
                $end = Carbon::parse($request->reportEntriesEndDate)->endOfDay();

                $enrollmentCount = Enrollment::select('enrollment_status', DB::raw('COUNT(*) as total'))
                    ->where('course_id', $course->id)
                    ->whereBetween('start_date', [$start, $end])
                    ->whereIn('enrollment_status', ['finished', 'late_finish', 'failed'])
                    ->groupBy('enrollment_status')
                    ->pluck('total', 'enrollment_status');


                $enrollments = Enrollment::where('course_id', $course->id)
                    ->with('enrolledUser')
                    ->whereBetween('start_date', [$start, $end])
                    ->whereIn('enrollment_status', ['finished', 'late_finish', 'failed'])
                    ->get();

                $totalEnrollments = Enrollment::where('course_id', $course->id)->count();

                $completedEnrollments = Enrollment::where('course_id', $course->id)
                    ->whereIn('enrollment_status', ['finished', 'late_finish'])
                    ->count();

                $completionRate = $totalEnrollments > 0
                    ? ($completedEnrollments / $totalEnrollments) * 100
                    : 0;

                $genBy = $request->user_name ?? 'System Generated';
                $startscope = $request->reportEntriesStartDate;
                $endscope = $request->reportEntriesEndDate;

                $entries = $enrollments->chunk(20);
                if($enrollments->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }

                $pdf = Pdf::loadView('reports.template', [
                    "name" => "Course Performance Report",
                    "date" => now()->format('Y-m-d'),
                    "usedFor" => 'coursePerformance',
                    "genby" => $genBy,
                    "course" => $course,
                    "entries" => $entries,
                    "counts" => $enrollmentCount,
                    "completionRate" => $completionRate,
                    "entry" => $entries,
                ]);

                return $pdf->download("CoursePerformance_{$course->id}.pdf");
            }
            case 'courseCompletion':{
                $course = Course::with(['categories','author','career_level'])
                    ->find($request->course_id);
                $start_date = $request->input('start_date');
                $end_date = $request->input('end_date');
                $division_id = $request->input('division_id');
                $department_id = $request->input('department_id');
                $userQuery = $course->enrolledUsers()->whereIn('enrollment_status', ['finished', 'late_finish', 'failed']);
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
                    $userQuery->whereHas('division', fn($q) => $q->where('division_id', $division_id));
                }
                if($department_id){
                    $userQuery->whereHas('department', fn($q) => $q->where('department_id', $department_id));
                }
                $enrolledUsers = $userQuery->get();
                if($enrolledUsers->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }
                $finalUsers = $enrolledUsers->map(function($user){
                    $subs = [
                        'finished' => 'Passed',
                        'failed' => 'Failed',
                        'late_finish' => 'Passed'
                    ];
                    return [
                        'employeeID' => $user->employeeID,
                        'user' => $user->fullName(),
                        'status' => $subs[$user->pivot->enrollment_status],
                        'start_date' => $user->pivot->start_date,
                        'end_date' => $user->pivot->end_date,
                        'updated_at' => $user->pivot->updated_at
                    ];
                });
                $statusCount = [
                    "passed_count" => $enrolledUsers->where('pivot.enrollment_status', 'finished')->count(),
                    "failed_count" => $enrolledUsers->where('pivot.enrollment_status', 'failed')->count(),
                    "on_time" => $enrolledUsers->where('pivot.enrollment_status', 'finished')->filter(fn($e) => Carbon::parse($e->updated_at)->lessThanOrEqualTo(Carbon::parse($e->end_date)))->count(),
                    "late" => $enrolledUsers->where('pivot.enrollment_status', 'late_finish')->count(),
                ];
                $chunked = $finalUsers->chunk(20)->map(fn($chunk) => array_values($chunk->toArray()))->values()->toArray();
                $pdf = Pdf::loadView('reports.template', [
                    'name' => 'Course Completion Report',
                    'date' => now()->format('Y-m-d'),
                    'genby' => $request->user_name ?? 'System Generated',
                    'usedFor' => 'courseCompletion',
                    'scope' => 'All finished users of course',
                    'entries' => $chunked,
                    'course' => $course,
                    'statusCount' => $statusCount,
                ]);
                return $pdf->download("Course_Performance_Report_".now()->format('Y-m-d').".pdf");

            }
            case 'courseTimeline' :{
                $course = Course::with(['categories','author','career_level'])
                    ->find($request->course_id);
                $start_date = $request->input('start_date');
                $end_date = $request->input('end_date');
                $division_id = $request->input('division_id');
                $department_id = $request->input('department_id');
                $userQuery = $course->enrolledUsers()->whereIn('enrollment_status', ['enrolled', 'ongoing', 'past-due', 'due-soon']);
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
                    $userQuery->whereHas('division', fn($q) => $q->where('division_id', $division_id));
                }
                if($department_id){
                    $userQuery->whereHas('department', fn($q) => $q->where('department_id', $department_id));
                }
                $enrolledUsers = $userQuery->get();
                if($enrolledUsers->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }
                $finalUsers = $enrolledUsers->map(function($enroll){
                    $user = $enroll->fullName();
                    $status = $enroll->pivot->enrollment_status;
                    $start = $enroll->pivot->start_date;
                    $end = $enroll->pivot->end_date;
                    return [
                        'employeeID' => $enroll->employeeID ?? 'N/A',
                        'user' => $user,
                        'status' => $status,
                        'start_date' => $start,
                        'end_date' => $end,
                    ];
                });

                $statusCount = [
                    "enrolled_count" => $enrolledUsers->where('pivot.enrollment_status', 'enrolled')->count(),
                    "ongoing_count" => $enrolledUsers->where('pivot.enrollment_status', 'ongoing')->count(),
                    "pastdue_count" => $enrolledUsers->where('pivot.enrollment_status', 'past-due')->count(),
                    "duesoon_count" => $enrolledUsers->where('pivot.enrollment_status', 'due-soon')->count(),
                ];

                $entries = $finalUsers->chunk(20)->map(fn($chunk) => array_values($chunk->toArray()))->values()->toArray();
                Log::info('testbefore', $statusCount);

                $pdf = Pdf::loadView('reports.template', [
                    'name' => 'Course Timeline Report',
                    'date' => now()->format('Y-m-d'),
                    'genby' => $request->user_name ?? 'System Generated',
                    'usedFor' => 'courseTimeline',
                    'scope' => 'All not finished learners',
                    'entries' => $entries,
                    'course' => $course,
                    'statusCount' => $statusCount,
                ]);


                return $pdf->download("Course_Timeline_Report_".now()->format('Y-m-d').".pdf");
            }
            case 'courseCertification' :{
                $startDate = Carbon::parse($request->reportEntriesStartDate)->startOfDay();
                $endDate   = Carbon::parse($request->reportEntriesEndDate)->endOfDay();

                $course = Course::with(['categories','author','career_level'])
                    ->find($request->course_id);

                $enrollments = Enrollment::where('course_id', $course->id)
                ->whereIn('enrollment_status', ['finished', 'late_finish'])
                ->whereBetween('start_date', [$startDate, $endDate])
                ->with('enrolledUser.title.department.division', 'enrolledUser.career_level')
                ->get();

                // $certifiedUsers = $enrollments->map(function($enroll){
                //     $learners = $enroll->enrolledUser;
                //     return $learners;
                // });


                if($enrollments->isEmpty()) {
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }


                $pdf = Pdf::loadView('reports.template', [
                    'name' => 'Course Certification Report',
                    'date' => now()->format('Y-m-d'),
                    'genby' => $request->user_name ?? 'System Generated',
                    'usedFor' => 'courseCertification',
                    'scope' => 'All action of the user',
                    'entries' => $enrollments,
                    'course' => $course,
                ]);

                return $pdf->download("Course_Certification_Report_".now()->format('Y-m-d').".pdf");

                // return response()->json([
                //     "course" => $course,
                //     "entries" => $entries,
                // ], 200);
            }
            case "assessmentresults": {
                $assessment = Test::find($request->test_id);
                $start_date = $request->input('start_date');
                $end_date = $request->input('end_date');
                $division_id = $request->input('division_id');
                $department_id = $request->input('department_id');
                $attemptQuery = $assessment->attempts()
                                ->with('user', 'questions')
                                ->where('is_completed', true);
                if($start_date && $end_date){
                    $attemptQuery->where(function($q)use ($start_date, $end_date){
                        $q->whereBetween('created_at', [
                            $start_date,
                            $end_date,
                        ]);
                    });
                }
                if($division_id){
                    $attemptQuery->whereHas('user.division', fn($q) => $q->where('division_id', $division_id));
                }
                if($department_id){
                    $attemptQuery->whereHas('user.department', fn($q) => $q->where('department_id', $department_id));
                }


                $uniqueAttempts = $attemptQuery->selectRaw('DISTINCT ON (user_id) *')
                                ->orderBy('user_id')
                                ->orderByDesc('score')
                                ->get();
                if($uniqueAttempts->isEmpty()){
                    return response()->json(['message' => 'No data found for the specified criteria.'], 404);
                }

                $attemptsCount = $assessment->attempts()
                                ->where('is_completed', true)
                                ->select('user_id', FacadesDB::raw('COUNT(*) as total_attempts'))
                                ->groupBy('user_id')
                                ->get();

                $totalAttempts = 0;
                $averageAttempts = $attemptsCount->map(function($single) use (&$totalAttempts){
                    $totalAttempts += $single->total_attempts;
                });
                $averageAttempts = round($totalAttempts / $attemptsCount->count(), 2); //Sum of attempts of users / Number of users

                $passed = 0;
                $failed = 0;
                $total = $attemptsCount->count();
                $output = $uniqueAttempts->map(function($attempt) use($attemptsCount, $assessment, &$passed, &$failed){
                    $user = $attempt->user;
                    $bestScore = $attempt->score;
                    $total_attempt = optional($attemptsCount->firstWhere('user_id', $attempt->user_id))->total_attempts ?? 0;
                    $remarks = '';
                    if($bestScore > $assessment->passingScore()){
                        $remarks = 'Passed';
                        $passed += 1;
                    } else{
                        $remarks = 'Failed';
                        $failed += 1;
                    }

                    return [
                        'employeeID' => $user->employeeID ?? 'N/A',
                        'user' => $user->fullName(),
                        'bestScore' => $bestScore,
                        'totalAttempts' => $total_attempt,
                        'status' => $remarks
                    ];
                });
                $stats = [
                    'passed' => $passed,
                    'failed' => $failed,
                    'total' => $total,
                    'average' => $averageAttempts,
                ];

                $entries = $output->chunk(20)->map(fn($chunk) => array_values($chunk->toArray()))->values()->toArray();

                $pdf = Pdf::loadView('reports.template', [
                    'name' => 'Assessment Results Report',
                    'date' => now()->format('Y-m-d'),
                    'genby' => $request->user_name ?? 'System Generated',
                    'usedFor' => 'assessmentresults',
                    'scope' => 'All Learner Test Result',
                    'entries' => $entries,
                    'test' => $assessment,
                    'course' => $assessment->course,
                    'stats' => $stats,
                ]);
                return $pdf->download("Assessment_Result_Report_".now()->format('Y-m-d').".pdf");
            }
        }
    }




    // public function index()
    // {
    //     $reports = Report::where('generated_by', Auth::id() ?? 1)->latest()->get();
    //     return response()->json($reports);
    // }

    // //Tables Related Functions
    // public function getColumnNames($table) {
    //     if(!Schema::hasTable($table)) {
    //         return response()->json(['error' => 'Table not found'], 404);
    //     }

    //     $columns = Schema::getColumnListing($table);

    //     return response()->json($columns);
    // }

    //reportGen in paper
    public function test($course_id)
    {
        $course = Course::with(['adder', 'categories', 'types', 'training_modes','author' ])
            ->find($course_id);

        $totalLesson = Course::find($course_id)->with('lessons')->count();
        $learner = Course::find($course_id)
            ->enrolledUsers()->get();

        $data = $learner->map(function ($learner) use ($course_id, $totalLesson) {
            $completedLessons = $learner->lessonsCompletedCount($course_id);
            return [
                'learner' => $learner,
                'progress' => $totalLesson > 0 ? ($completedLessons / $totalLesson) * 100 : 0,
            ];
        });


        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }




        $entries = $data->chunk(20);

        $pdf = Pdf::loadView('reports.template', [
                'name' => 'Course Performance Report',
                'date' => now()->format('Y-m-d'),
                'genby' => "Me",
                'scope' => 'All action of the user',
                'entries' => $entries,
                'usedFor' => 'coursePerformance',
                'course' => $course,
        ])->setPaper('letter', 'portrait');

        return $pdf->stream("Course_Performance_Report_{$course->id}.pdf");

    }

}
?>
