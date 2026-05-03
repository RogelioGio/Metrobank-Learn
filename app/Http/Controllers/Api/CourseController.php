<?php

namespace App\Http\Controllers\Api;

use App\Events\AssignCourseAdmin;
use App\Filters\CourseFilter;
use App\Filters\CourseSort;
use App\Filters\UserInfosFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkAddPermissionsToCourse;
use App\Http\Requests\BulkAssignCourseAdmins;
use App\Http\Requests\BulkStoreCourseRequest;
use App\Http\Requests\CourseSearchRequest;
use App\Http\Requests\StartEndDateRequest;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\UserInfoResource;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonFile;
use App\Models\Training_Mode;
use App\Models\Type;
use App\Models\User_Test_Attempt;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnUserReports;
use App\Notifications\NotifyAssignedCourseAdmin;
use App\Services\UserLogService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use PhpParser\Node\Expr\Assign;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = new CourseFilter();
        $sort = new CourseSort();
        $builder = Course::query();
        $querySort = $sort->transform($builder, $request);
        $queryfilter = $filter->transform($querySort, $request);

        $page = $request->input('page',1); // default page
        $perPage = $request->input('perPage', 3); // default per page

        $userId = Auth::user()->userInfos->id;
        $courses = $queryfilter->with('lessons', 'attachments', 'tests', 'tests.questions','categories','career_level', 'author', 'author.userCredentials', 'categories',)
                    ->whereNotIn('status', ['for_archive', 'archived'])
                    ->whereDoesntHave('enrollments', function ($query) use ($userId){
                        $query->where('user_id', $userId);
                    })
                    ->whereDoesntHave('selfEnrollRequests', function ($query) use ($userId){
                        $query->where('user_id', $userId);
                    })
                    ->paginate($perPage);


        // GET /courses
        return response() -> json([
            'data' => CourseResource::collection($courses),
            'total' => $courses->total(),
            'lastPage' => $courses->lastPage(),
            'currentPage' => $courses->currentPage(),
        ],200);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
        // $data = $request->all();
        // $type = Type::query()->firstOrCreate(["type_name" => $data['type_name']]);
        // $category = Category::query()->firstOrCreate(["category_name" => $data['category_name']]);
        // $current_user = Auth::user();

        // $course = Course::create([
        //     "name" => $data['name'],
        //     "CourseID" => $data['CourseID'],
        //     "course_outcomes" => $data['course_outcomes'],
        //     "course_objectives" => $data['course_objectives'],
        //     "description" => $data['description'],
        //     "training_type" =>$data['training_type'],
        //     "system_admin_id" => $current_user->userInfos->id,
        //     "archived" => $data['archived'],
        //     "months" => $data['months'],
        //     "weeks" => $data["weeks"],
        //     "days" => $data['days']
        //     ]);

        // foreach($data['lessons'] as $lessons){
        //     $lesson = Lesson::create(['lesson_name' => $lessons['LessonName'],
        //                 'lesson_content_as_json' => $lessons['LessonContentAsJSON']]);
        //     $course->lessons()->save($lesson);
        //     // foreach($lessons['files'] as $files){
        //     //     $file = $request->file('lessons.*.files.*.file');
        //     //     $path = $file->store('/'.$course->name.'/'.$lesson->lesson_name, 'lessonfiles');
        //     //     $file = LessonFile::create(['file_name' => $files['file_name'], 'file_type' => $files['file_type'], 'file_path' => $path]);
        //     //     $file->lesson()->associate($lesson);
        //     // }
        // }

        // $course->types()->syncWithoutDetaching($type->id);
        // $course->categories()->syncWithoutDetaching($category->id);
        // $course->save();
        // return response()->json([
        //     "course" => $course->load(['lessons']),
        //     "types" => $course->types,
        //     "categories" => $course->categories,
        // ], 200);
    }

    public function bulkStore(BulkStoreCourseRequest $request){
        // $bulk = collect($request->all())->map(function($arr, $key){
        //     return $arr;
        // });

        // Course::insert($bulk->toArray());
        // return response()->json([
        //     "Message" => "Bulk Store complete",
        //     "Data" => $bulk
        // ]);
    }

    public function setCoursePermissions(Course $course, BulkAddPermissionsToCourse $request){
        $permissions = collect($request->validated())->map(function($arr, $key){
            return $arr;
        });

        $course->course_permissions()->sync($permissions->toArray());
        return response()->json([
            "Message" => "Permissions added to course",
            "Data" => $course->course_permissions
        ]);
    }

    public function assignCourseAdmin(BulkAssignCourseAdmins $bulkAssignCourseAdmins, ZCompELearnCreatedCourse $course)
    {
        $course->CourseStatus = 'distributed';
        $course->save();

        $courseModel = Course::where('courseID', $course->CourseID)->first();

        $distributor = $bulkAssignCourseAdmins->input('distributor_id');
        $bulk = collect($bulkAssignCourseAdmins->input('data'))->filter(function($user){
            $temp = UserInfos::find($user['user_id']);
            return $temp && ($temp->hasRole('Course Admin') || $temp->hasRole('System Admin'));
        })->mapWithKeys(function($user) use($distributor){
            return [
                $user['user_id'] => ['distributor_id' => $distributor]
            ];
        })->toArray();

        $rootUser = UserInfos::with('roles')->whereHas('permissions', function($q){
            $q->where('permission_name', 'Root');
        })->first();
        if ($rootUser && ($rootUser->hasRole('Course Admin') || $rootUser->hasRole('System Admin'))) {
            if (!array_key_exists($rootUser->id, $bulk)) {
                $bulk[$rootUser->id] = ['distributor_id' => $distributor];
            }
        }

        $userids = array_keys($bulk);
        $courseAdminsCreds = UserCredentials::whereHas('userInfos', function ($q) use ($userids) {
            $q->whereIn('id', $userids);
        })->get();

        $courseModel->assignedCourseAdmins()->syncWithoutDetaching($bulk);
        $distributorInfo = UserInfos::find($distributor);
        Notification::send($courseAdminsCreds, new NotifyAssignedCourseAdmin($courseModel, $distributorInfo));

        $distributorName = trim($distributorInfo->first_name . ' ' . $distributorInfo->middle_name . ' ' . $distributorInfo->last_name);
        $assignedUsers = UserInfos::whereIn('id', $userids)->get()->map(function ($userInfo) {
            return $userInfo->first_name . ' ' . $userInfo->last_name;
        })->toArray();

        ZCompELearnUserReports::create([
            'user_info_id' => $distributor,
            'Action' => 'Course Distributed',
            'Details' => [
                'Distributed By' => $distributorName,
                'Assigned Users Count' => count($userids),
                'Assigned Users' => implode(', ', $assignedUsers),
                'Course ID' => $course->CourseID,
                'Course Name' => $course->CourseName,
            ],
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => "Course Admins assigned to " . $courseModel->courseName,
        ]);
    }


    public function fetchAssignedCourseAdmins(ZCompELearnCreatedCourse $course)
    {
        $course = Course::where('courseID', $course->CourseID)->first();

        $assignedAdmins = $course->assignedCourseAdmins()->with('roles')->get();

        $result = $assignedAdmins->map(function ($admin) {
            return [
                'user_id' => $admin->id,
                'name' => $admin->name,
                'distributor_id' => $admin->pivot->distributor_id ?? null,
            ];
        });

        return response()->json([
            'course' => $course->name,
            'assigned_course_admins' => $result,
        ]);
    }

    public function publishCourse(Course $course){
        // $course->update(['published', true]);

        // return response()->json([
        //     'message' => 'Course has been published'
        // ]);
    }

    //You add course id then mode/category/type id in url
    public function addCategory(Course $course, Category $category){
        $course->categories()->attach($category->id);
        return response()->json([
            "Message" => "Category Added",
            "Data" => $course
        ]);
    }

    public function removeCategory(Course $course, Category $category){
        $course->categories()->detach($category->id);
        return response()->json([
            "Message" => "Category Removed",
            "Data" => $course
        ]);
    }

    public function addType(Course $course, Type $type){
        $course->types()->attach($type->id);
        return response()->json([
            "Message" => "Type Added",
            "Data" => $course
        ]);
    }

    public function removeType(Course $course, Type $type){
        $course->types()->detach($type->id);
        return response()->json([
            "Message" => "Type Removed",
            "Data" => $course
        ]);
    }

    public function getCourseUsers(Course $course, Request $request){
        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };


        $page = $request->input('page', 1); // default page
        $perPage = $request->input('per_page', 5); // default per page
        $acceptedEnrollmentFilter = ['enrolled', 'ongoing', 'finished', 'past-due', 'late_finish', 'failed', 'due-soon'];

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);
        $lesson_count = $course->modulesCount();

        $query = $course->enrollments()->whereHas('enrolledUser', function($subQuery) use($queryItems, $request){
            $subQuery->mergeConstraintsFrom($queryItems)->where('status', '=', 'Active')
                        ->whereNot('id', $request->user()->userInfos->id);
        });

        if($request->has('enrollment_status')){
            $status = $request->input('enrollment_status')['eq'];

            if($status === 'pastdue'){
                $query->where('enrollment_status', 'past-due');
            } else
            if(in_array($status, $acceptedEnrollmentFilter)){
                if ($status === 'failed') {
                    $query->whereHas('enrolledUser', function($q) use ($course) {
                        $q->whereHas('enrollments', function($sub) use ($course) {
                            $sub->where('enrollment_status', 'failed')->where('course_id', $course->id);
                        })->whereDoesntHave('enrollments', function($sub) use ($course){
                            $sub->where('enrollment_status', '!=', 'failed')->where('course_id', $course->id);
                        });
                    });
                } else {
                    $query->where('enrollment_status', $status);
                }
            }

        }
        $enrolls = $query->paginate($perPage);

        foreach($enrolls as $enroll){
            $enroll->enrolledUser->load(['title.department.division','title.careerLevel','city','branch']);
            $enroll->enrollment_status = $enroll->enrollment_status;
            $enroll->due_soon = $enroll->due_soon;
            $enroll->completed_percentage = round(($enroll->enrolledUser->completedModules($course->id, $enroll->id)/$course->modulesCount()) * 100, 2);
        }

        return response() -> json([
            'data' => $enrolls,
            'total' => $enrolls->total(),
            'lastPage' => $enrolls->lastPage(),
            'currentPage' => $enrolls->currentPage(),
        ]);
    }

    public function selfEnrollCourses(UserInfos $user, Request $request){
        $userId = $user->id;
        $userCareerRank = $user->career_level->rank;
        $perPage = $request->input('perPage', 3); // default per page
        $self_enrolls = $request->query('self_enroll');
        $filter = new CourseFilter();
        $sort = new CourseSort();
        if($self_enrolls === "true"){
            $builder = $user->selfEnrollmentRequests;
        } else if($self_enrolls === "false"){
            $builder = Course::query();
            $querySort = $sort->transform($builder, $request);
            $queryfilter = $filter->transform($querySort, $request);

            $courses = $queryfilter->whereHas('career_level', function($query) use ($userCareerRank){
                $query->where('rank', '<=', $userCareerRank);
            })
            ->whereDoesntHave('enrolledUsers', function ($query) use ($userId){
                $query->where('user_id', $userId);
            })
            ->whereDoesntHave('userSelfEnrollRequests', function ($query) use ($userId){
                $query->where('user_id', $userId);
            })
            ->with('lessons', 'attachments', 'tests', 'tests.questions','categories','career_level', 'author', 'author.userCredentials')
            ->paginate($perPage);

            $courses->getCollection()->transform(function($course){
                $course->requested = false;
            });
        }


        return response() -> json([
            'data' => $courses->items(),
            'total' => $courses->total(),
            'lastPage' => $courses->lastPage(),
            'currentPage' => $courses->currentPage(),
        ]);

    }

    public function removeEnrolledUser(UserInfos $userInfos, Course $course, UserLogService $log, Request $request){
        $enrollmentbuilder = $course->enrollments()->where([['user_id', $userInfos->id], ['enrollment_status', 'enrolled']]);
        if($enrollmentbuilder->exists()){
            $enrollmentbuilder->delete();
            $current = $request->user()->userInfos;
            $log->log(
                $current->id,
                'RemovedEnrollment',
                $current->fullName().' has removed the enrollment of '.$userInfos->fullName().' from course'. $course->courseName,
                $request->ip(),
            );
            return response()->json([
                'message' => 'User removed from course'
            ]);
        } else{
            return response()->json([
                'message' => 'User has already taken the course'
            ]);
        }
        return response()->json([
            'message' => 'User is not enrolled in the course'
        ], 404);

    }

    public function countCourseStatus(UserInfos $userInfos){
        $enrollments = $userInfos->enrollments()->get();
        $enrolled = 0;
        $ongoing = 0;
        $due_soon = 0;
        $finished = 0;
        foreach($enrollments as $enrollment){
            $deadline = Carbon::parse($enrollment->end_date);
            if(!$deadline->isPast()){
                if($enrollment->enrollment_status == 'enrolled'){
                    $enrolled++;
                } elseif($enrollment->enrollment_status == 'ongoing'){
                    $ongoing++;
                } elseif($enrollment->enrollment_status == 'finished'){
                    $finished++;
                }
                if($enrollment->due_soon == true || !($enrollment->enrollment_status == 'finished')){
                    $due_soon++;
                }
            } else if($enrollment->allow_late == true){
                if($enrollment->enrollment_status == 'enrolled'){
                    $enrolled++;
                } elseif($enrollment->enrollment_status == 'ongoing'){
                    $ongoing++;
                }
            }
        }
        return response()->json([
            'Enrolled' => $enrolled,
            'Ongoing' => $ongoing,
            'Finished' => $finished,
            'DueSoon' => $due_soon
        ]);
    }

    public function checkIfExist($courseId){
        $exists = Course::where('CourseID', $courseId)->exists();
        if($exists){
            return response()->json([
                'Error' => 'Course already exists.'
            ],409);
        }
        return response()->json([
            'message' => 'Course ID is available.'
        ], 200);
    }

    //CHANGE
    public function getAssignedCourseAdmin(Course $course, Request $request){
        $page = $request->input('page', 1); // default page
        $perPage = $request->input('per_page', 5); // default per page

        $admins = $course->assignedCourseAdmins()
        ->with(['branch', 'department', 'branch.city', 'title','division'])
        ->paginate($perPage);

        $main = $course->adder()->with(['branch', 'department', 'branch.city', 'title', 'division'])->get();

        return response()->json([
            'data' => $admins->items(),
            'main' => $main,
            'total' => $admins->total(),
            'lastPage' => $admins->lastPage(),
            'currentPage' => $admins->currentPage(),
        ], 200);

    }

    public function CourseSearch(CourseSearchRequest $request){
        $search = $request['search'];
        $perPage = $request->input('perPage', 5); //Number of entry per page
        $page = $request->input('page', 1);//Default page
        $status = $request['status'] ?? 'active';
        $user_id = $request['user_id'] ?? null;
        $relation = $request['relation'] ?? 'enrolled';
        $result = Course::search($search);

        if(!$user_id){
            $result = $result->query(function ($query) use ($status){
                $query->where('archived', '=', $status)
                    ->with(['categories', 'types']);
                    return $query;
            })->paginate($perPage);
        } else {
            $result = $result->query(function ($query) use ($status, $user_id, $relation){
                if($relation == 'enrolled'){
                    $query->whereHas('enrollments', function($subQuery) use ($user_id){
                        $subQuery->where('user_id', '=', $user_id);
                    })->where('archived', '=', $status)
                    ->with(['categories', 'types']);
                    return $query;
                } else if($relation == 'assigned'){
                    $query->whereHas('assignedCourseAdmins', function($subQuery) use ($user_id){
                        $subQuery->where('user_id', '=', $user_id);
                    })
                    ->whereHas('adder', function($subQuery) use ($user_id){
                        $subQuery->where('id', '=', $user_id);
                    })
                    ->where('archived', '=', $status)
                    ->with(['categories', 'types']);
                    return $query;
                }
            })->paginate($perPage);
        }

        return response()->json([
            'data' => $result->items(),
            'total' => $result->total(),
            'lastPage' => $result->lastPage(),
            'currentPage' => $result->currentPage(),
        ], 200);
    }

    public function alarmArchiveCourse(){

    }

    public function hardDeleteCourse(){

    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load(['categories','lessons']);
        return $course;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        // $temp = $course->update($request->all());
        // return response((new CourseResource($course))->toArray($request), 204);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $temp = $course->toArray();
        $temp["archived"] = "archived";
        $course->update($temp);

        return response()->json([
            $temp
        ]);
    }

    public function merge($id) {
        $publishedCourses = ZCompELearnCreatedCourse::where('CourseStatus', "published")->with('lessons', 'attachments', 'tests', 'tests.customBlocks')->find($id);

        $course = Course::create([
            'courseName' => $publishedCourses->CourseName,
            'courseID' => $publishedCourses->CourseID,
            'overview' => $publishedCourses->Overview,
            'objective' => $publishedCourses->Objective,
            'training_type' => $publishedCourses->TrainingType,
            'career_level_id' => $publishedCourses->career_level_id,
            'status' => 'active',
            'category_id' => $publishedCourses->category_id,
            'user_info_id' => $publishedCourses->user_info_id,
            'image_path' => "null"
        ]);

        foreach($publishedCourses->lessons as $lesson){{
            $course->lessons()->create([
                'lesson_name' => $lesson->LessonName,
                'lesson_content_as_json' => $lesson->LessonContentAsJSON,
                'item_order' => $lesson->currentOrderPosition,
            ]);
        }}

        foreach ($publishedCourses->attachments as $attachment) {
            $course->attachments()->create([
                'FileName' => $attachment->FileName,
                'FilePath' => $attachment->FilePath,
                'VideoName' => $attachment->VideoName,
                'VideoPath' => $attachment->VideoPath,
                'currentOrderPosition' => $attachment->currentOrderPosition,
                'AttachmentDescription' => $attachment->AttachmentDescription,
                'AttachmentType' => $attachment->AttachmentType,
            ]);
        }

        foreach ($publishedCourses->tests as $test) {
            $assessment = $course->tests()->create([
                'TestName' => $test->TestName,
                'TestDescription' => $test->TestDescription,
                'TestType' => $test->TestType,
                'currentOrderPosition' => $test->currentOrderPosition,
            ]);
            foreach($test->customBlocks as $block){
                $assessment->questions()->create([
                'QuestionType' => $block->QuestionType,
                'BlockData' => json_encode($block->BlockData),
            ]);
            }
        }

        return response()->json([
            'message' => 'Course merged successfully',
            'course' => $course,
        ], 201);
    }

    public function getThings($id){
        $publishedCourses = ZCompELearnCreatedCourse::with('lessons', 'attachments', 'tests', 'tests.customBlocks')->find($id);

        return response()->json([
            'data' => $publishedCourses
        ], 200);
    }

    public function exportCertification(UserInfos $user, Course $course){
        $certified = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('enrollment_status', 'finished')
                    ->first();

        $certificate = Course::with('certificate.creditors')->find($course->id);

        $creditors = $certificate->certificate
        ? $certificate->certificate->creditors
        : collect();



        if(!$certified){
            return response()->json([
                'Error' => 'User is not yet certified for this course.'
            ],409);
        } else {
            $certificate = Pdf::loadView('certificate.template',
            [
                    'name' => $certified->enrolledUser->first_name . ' ' .
                            ($certified->enrolledUser->middle_name ?? '') . ' ' .
                            $certified->enrolledUser->last_name,
                    'course' => $course->courseName,
                    'date_of_completion' => $certified->updated_at->format('F j, Y'),
                    'creditors' => $creditors
            ])->setPaper('letter', 'landscape');

            return $certificate->stream('certificate.pdf');
        }
        // export logic here
    }

    public function coursePerformance(Course $course, StartEndDateRequest $request){
        $validated = $request->validated();
        $enrollmentCount = Enrollment::select('enrollment_status', DB::raw('COUNT(*) as total'))
                                ->where('course_id',$course->id)
                                // ->where('start_date', '>=', $validated['start_date'])
                                // ->where('end_date', '<=', $validated['end_date'])
                                ->whereIn('enrollment_status', ['finished', 'late_finish', 'failed'])
                                ->groupBy('enrollment_status')
                                ->pluck('total', 'enrollment_status');
        $enrollments = Enrollment::where('course_id',$course->id)
                                ->with('enrolledUser')
                                // ->where('start_date', '>=', $validated['start_date'])
                                // ->where('end_date', '<=', $validated['end_date'])
                                ->whereIn('enrollment_status', ['finished', 'late_finish', 'failed'])
                                ->get();

        return [
            'enrollment_count' => $enrollmentCount,
            'total_enrollments' => $enrollments,
            'average_completion_time_days' => $enrollments->count() > 0 ? round($enrollments->avg(fn($enroll) => Carbon::parse($enroll->end_date)->diffInDays(Carbon::parse($enroll->start_date))), 2) : 0,
        ];
    }

    public function courseTimeline(Course $course, StartEndDateRequest $request){
        $validated = $request->validated();
        $enrollment = Enrollment::where('course_id',$course->id)
                                ->where('start_date', '>=', $validated['start_date'])
                                ->where('end_date', '<=', $validated['end_date'])
                                ->where(function($q){
                                    $q->where('enrollment_status', 'enrolled')
                                    ->orWhere('enrollment_status', 'ongoing');
                                })->get();

        $enrolledUsers = $enrollment->map(function($enroll){
            $user = $enroll->enrolledUser->fullName();
            $status = $enroll->enrollment_status;
            $start = $enroll->start_date;
            $end = $enroll->end_date;
            return [
                'name' => $user,
                'status' => $status,
                'start_date' => $start,
                'end_date' => $end,
            ];
        });

        return $enrolledUsers;
    }

    public function certifiedLearners(Course $course, StartEndDateRequest $request){
        $validated = $request->validated();
        $enrollments = Enrollment::where('course_id',$course->id)
                                ->where('start_date', '>=', $validated['start_date'])
                                ->where('end_date', '<=', $validated['end_date'])
                                ->whereIn('enrollment_status', ['finished', 'late_finish'])
                                ->with('enrolledUser.title.department.division', 'enrolledUser.career_level')
                                ->get();

        $finishedLearners = $enrollments->map(function($enroll){
            $user = $enroll->enrolledUser;
            return $user;
        });

        return $finishedLearners;
    }

    public function certifiedLearnersPerDepartment(Course $course, StartEndDateRequest $request){
        $validated = $request->validated();
        $enrollments = Enrollment::where('course_id',$course->id)
                                ->where('start_date', '>=', $validated['start_date'])
                                ->where('end_date', '<=', $validated['end_date'])
                                ->whereIn('enrollment_status', ['finished', 'late_finish'])
                                ->with('enrolledUser.title.department.division', 'enrolledUser.career_level')
                                ->get();

        $count = $enrollments->groupBy(fn($enrollment) => $enrollment->enrolledUser->department->department_name)->map->count();

        return $count;
    }

    public function courseAssessmentOverview(Course $course, StartEndDateRequest $request){
        $validated = $request->validated();
        $enrollments = Enrollment::where('course_id',$course->id)
                                ->where('start_date', '>=', $validated['start_date'])
                                ->where('end_date', '<=', $validated['end_date'])
                                ->with('enrolledUser')
                                ->get();

        $tests = User_Test_Attempt::where('created_at', '>=',$validated['start_date']);
        $output = [];
        foreach($course->tests as $test){
            $totalScore = 0;
            foreach($test->questions as $question){
                $totalScore +=$question->score();
            }
            $passedLearners = 0;
            $failedLearners = 0;
            $AverageScore = 0;
            $AverageAttempt = 0;
            $count = 0;
            $passing = $test->passing_rate;
            $passingScore = $totalScore * $passing;
            foreach($enrollments as $enrollment){
                $attempt = $tests->where('user_id', $enrollment->enrolledUser)
                    ->where('enrollment_id', $enrollment->id)
                    ->where('is_completed',true)
                    ->orderBy('score', 'desc')
                    ->first();
                $count += 1;
                $AverageScore += $attempt->score;
                if($attempt->score >= $passingScore){
                    $passedLearners += 1;
                } else {
                    $failedLearners += 1;
                }
                $attemptCount = $tests->where('user_id', $enrollment->enrolledUser)
                    ->where('enrollment_id', $enrollment->id)
                    ->where('is_completed',true)
                    ->count();
                $AverageAttempt += $attemptCount;
            }
            $AverageS = $AverageScore / $count;
            $AverageA = $AverageAttempt / $count;
            $output['TestID: '.$test->id][] = [
                'TotalLearners' => $count,
                'PassedLearner' => $passedLearners,
                'FailedLearner' => $failedLearners,
                'AverageScore' => $AverageS,
                'AverageAttempt' => $AverageA
            ];
        }
        return $output;
    }

    public function seacrhEnrolledLearner(Course $course, Request $request){
        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };

        $enrollmentStatus = $request->input('status');
        $searchTerm = $request->input('q');
        $totalModules = $course->modulesCount();
        $perPage = $request->input('per_page', 12);

        $results = $course->enrollments()
                    ->with(['enrolledUser', 'enrolledUser.title', 'enrolledUser.title.department.division', 'enrolledUser.branch', 'enrolledUser.branch.city', 'enrolledUser.career_level', 'enrolledUser.roles', 'enrolledUser.userCredentials'])
                    ->whereNot('user_id', $request->user()->userInfos->id)
                    ->where('enrollment_status', $enrollmentStatus)
                    ->whereHas('enrolledUser', function ($q) use ($searchTerm) {
                        $q  ->where('status', '=', 'Active')
                            ->where(function ($query) use ($searchTerm) {
                                $query->where('first_name', 'ILIKE', "%{$searchTerm}%")
                                    ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                                    ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                                    ->orWhereHas('title', function ($q) use ($searchTerm) {
                                        $q->where('title_name', 'ILIKE', "%{$searchTerm}%");
                                    })
                                    ->orWhereHas('career_level', function ($q) use ($searchTerm) {
                                        $q->where('name', 'ILIKE', "%{$searchTerm}%");
                                    })
                                    ->orWhereHas('title.department.division', function ($q) use ($searchTerm) {
                                        $q->where('division_name', 'ILIKE', "%{$searchTerm}%");
                                    })
                                    ->orWhereHas('title.department', function ($q) use ($searchTerm) {
                                        $q->where('department_name', 'ILIKE', "%{$searchTerm}%");
                                    })
                                    ->orWhereHas('branch', function ($q) use ($searchTerm) {
                                        $q->where('branch_name', 'ILIKE', "%{$searchTerm}%");
                                    })
                                    ->orWhereHas('branch.city', function ($q) use ($searchTerm) {
                                        $q->where('city_name', 'ILIKE', "%{$searchTerm}%");
                                    });
                            });
                    })
                    ->paginate();
        foreach($results as $enrollees){
            $completed = count($enrollees->enrolledUser->moduleCompleted($course->id, $enrollees->id));
            $enrollees->completed_percentage = $totalModules > 0 ? round(($completed/ $totalModules) * 100, 2) : 0;
        }

        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);
    }

    public function courseAdminActivities(Request $request){
        $courseAdmins = $request->user()->userInfos;
        // $courseAdmins = UserInfos::find(18);

        $SelfEnrollmentReqPerCourse = $courseAdmins->assignedCourses()
            ->withCount(['selfEnrollRequests' => function ($query) use ($request) {
                $query->where('status', 'pending')
                        ->whereNot('user_id', $request->user()->userInfos->id);
            }])
            ->get()
            ->filter(fn($course) => $course->self_enroll_requests_count > 0)
            ->map(function ($course) {
                return [
                    'activityType' => "SelfEnrollmentRequest",
                    'course_id' => $course->id,
                    'course_name' => $course->courseName,
                    'pending_requests_count' => $course->self_enroll_requests_count,
                ];
            })->toArray();

        $DuesoonLearnerPerCourse = $courseAdmins->assignedCourses()
            ->withCount(['enrollments as due_soon_learners_count' => function ($query) use ($request) {
                $query->where('due_soon', true)
                      ->whereIn('enrollment_status', ['ongoing'])
                      ->whereNot('user_id', $request->user()->userInfos->id);
            }])
            ->get()
            ->filter(fn($course) => $course->due_soon_learners_count > 0)
            ->map(function ($course) {
                return [
                    'activityType' => "DueSoonLearners",
                    'course_id' => $course->id,
                    'course_name' => $course->courseName,
                    'due_soon_learners_count' => $course->due_soon_learners_count,
                ];
            })->toArray();

        $SubjectForRetake = $courseAdmins->assignedCourses()
            ->withCount(['enrollments as subject_for_retake_count' => function ($query) use ($request) {
                $query->where('enrollment_status', 'failed')
                    ->whereNot('user_id', $request->user()->userInfos->id)
                    ->whereNotIn('user_id', function ($sub) {
                    $sub->select('user_id')
                        ->from('enrollments as e2')
                        ->whereColumn('e2.course_id', 'enrollments.course_id')
                        ->whereIn('e2.enrollment_status', ['enrolled', 'ongoing', 'late_finish','due-soon', 'past-due', 'finished']);
                });
            }])
            ->get()
            ->filter(fn($course) => $course->subject_for_retake_count > 0)
            ->map(function ($course) {
                return [
                    'activityType' => "SubjectForRetake",
                    'course_id' => $course->id,
                    'course_name' => $course->courseName,
                    'subject_for_retake_count' => $course->subject_for_retake_count,
                ];
            })->toArray();


            $activities = array_merge($SelfEnrollmentReqPerCourse, $DuesoonLearnerPerCourse, $SubjectForRetake);
        return response()->json($activities, 200);
    }

    public function completedLearners(Course $course, Request $request) {
        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };

        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $division_id = $request->input('division_id');
        $department_id = $request->input('department_id');
        $enrollmentQuery = Enrollment::where('course_id',$course->id)->with(['enrolledUser', 'enrolledUser.title.department.division', 'enrolledUser.career_level'])
                                ->whereIn('enrollment_status', ['finished', 'late_finish','failed']);
        if($start_date && $end_date){
            $enrollmentQuery->where(function($q)use ($start_date, $end_date){
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
            $enrollmentQuery->whereHas('enrolledUser.division', function($q) use($division_id){
                $q->where('division_id', $division_id);
            });
        }
        if($department_id){
            $enrollmentQuery->whereHas('enrolledUser.division', function($q) use($department_id){
                $q->where('department_id', $department_id);
            });
        }

        $enrollment = $enrollmentQuery->get();

        return response()->json([
            "enrollments" => $enrollment,
            "passed_count" => $enrollment->where('enrollment_status', 'finished')->count(),
            "failed_count" => $enrollment->where('enrollment_status', 'failed')->count(),
            "on_time" => $enrollment->where('enrollment_status', 'finished')->filter(fn($e) => Carbon::parse($e->updated_at)->lessThanOrEqualTo(Carbon::parse($e->end_date)))->count(),
            "late" => $enrollment->where('enrollment_status', 'late_finish')->count(),
        ], 200);
    }

    public function assessmentPerformance(Course $course, Request $request)
    {

    $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  $request->user()->userInfos->id)->exists();
    if(!$isAssigned){
        return response()->json(['message' => 'You are not assigned to this course'], 403);
    };

    $assessments = $course->tests()->get();
    $start_date = $request->input('start_date');
    $end_date = $request->input('end_date');
    $division_id = $request->input('division_id');
    $department_id = $request->input('department_id');
    $attempts = $course->assessmentAttempts()->with('user.title.department.division');

    if($start_date && $end_date){
        $attempts->whereBetween('user__test__attempts.created_at', [
        Carbon::parse($start_date),
        Carbon::parse($end_date),
    ]);
    }
    if($division_id){
        $attempts->whereHas('user.division', fn($q) => $q->where('division_id', $division_id));
    }
    if($department_id){
        $attempts->whereHas('user.department', fn($q) => $q->where('department_id', $department_id));
    }

    $attempts = $attempts->get()->filter(fn($attempt) => !is_null($attempt->score));

    $assessments->each(function ($test) use ($attempts) {
        $testAttempts = $attempts->where('test_id', $test->id);

        $userAttempt = $testAttempts->groupBy('user_id');

        $passed = 0;
        $failed = 0;

        $totalScore = 0;
        foreach($test->questions as $question){
            $data = json_decode($question->BlockData, true);
            if(is_array($data) && isset($data['points'])) {
                $totalScore += $data['points'];
            }
        }

        $totalPossibleScore = max($totalScore, 1);
        $passing = $test->passing_rate;

        foreach($userAttempt as $takerId)
            {
                $bestScore = $takerId->max('score');
                $percentage = ($bestScore / $totalPossibleScore) * 100;

                if($percentage >= $passing) {
                    $passed++;
                } else {
                    $failed++;
                }
            }

        $takers = $userAttempt->map(function ($userAttempts) use ($totalPossibleScore, $passing, &$passed, &$failed) {
            $bestAttempt = $userAttempts->sortByDesc('score')->first();
            $percentage = round(($bestAttempt->score / $totalPossibleScore) * 100, 2);
            $status = $percentage >= $passing ? 'Passed' : 'Failed';
            return [
                'user' => new UserInfoResource($bestAttempt->user), // full user info
                'best_score' => $bestAttempt->score,
                'percentage' => round($percentage, 2),
                'status' => $status,
                'questions' => $bestAttempt->questions,
            ];
        })->values();

        $attemptCount = $testAttempts->count();
        $attemptCountPerUser = $test->attempts()
                ->where('is_completed', true)
                ->whereIn('user_id', $userAttempt->keys())
                ->select('user_id', DB::raw('COUNT(*) as total_attempts'))
                ->groupBy('user_id')
                ->get();

        $uniqueUserCount = $attemptCountPerUser->count() === 0 ? 1 : $attemptCountPerUser->count();

        $test->total_takers = $userAttempt->count();
        $test->passed = $passed;
        $test->failed = $failed;
        $test->takers = $takers;
        $test->average_attemptCount = round($attemptCount / $uniqueUserCount, 2);


    }) ;
    // $attempts = $course->assessmentAttempts->groupBy("test_id")
    //             ->map(function($attemptsByTest){
    //                 $test = $attemptsByTest->first()->test;
    //                 $taker = $attemptsByTest->groupBy('user_id')->map(function($attemptsByUser) use ($test){
    //                     $bestAttempt = $attemptsByUser->sortByDesc('score')->first();
    //                     $numberOfAttempts = $attemptsByUser->count();
    //                     return [
    //                         'learner' => $bestAttempt->user,
    //                         'number_of_attempts' => $numberOfAttempts,
    //                         'best_attempt' => $bestAttempt,
    //                     ];
    //                 })->values();

    //                 return[
    //                     'assessment' => $test,
    //                     'total_takers' => $taker->count(),
    //                     'takers' => $taker,
    //                 ];
    //             })->values();

    return response()->json([
        'assessments' => $assessments,
    ], 200);
    }

    public function getassessmentPerformance(Course $course, $test_id, Request $request) {
        $test = $course->tests()->where('id', $test_id)->first();

        if (!$test) {
            return response()->json(['message' => 'Assessment not found for this course'], 404);
        }

        // ✅ Input filters
        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
        $division_id = $request->input('division_id');
        $department_id = $request->input('department_id');

        // ✅ Prepare attempts query
        $attempts = $course->assessmentAttempts()
            ->with('user.title.department.division')
            ->where('test_id', $test_id);

        // --- Date range filter ---
        $table = $course->assessmentAttempts()->getModel()->getTable();

        if ($start_date && $end_date) {
            $attempts->whereBetween("$table.created_at", [
                Carbon::parse($start_date),
                Carbon::parse($end_date),
            ]);
        }

        // --- Division filter ---
        if ($division_id) {
            $attempts->whereHas('user.division', fn($q) => $q->where('division_id', $division_id));
        }

        // --- Department filter ---
        if ($department_id) {
            $attempts->whereHas('user.department', fn($q) => $q->where('department_id', $department_id));
        }

        // ✅ Fetch attempts (exclude null scores)
        $attempts = $attempts->get()->filter(fn($a) => !is_null($a->score));

        if ($attempts->isEmpty()) {
            $test->takers = [];
            $test->total_takers = 0;
            $test->passed = 0;
            $test->failed = 0;
            $test->average_attemptCount = 0;

            return response()->json($test);
        }

        // ✅ Compute performance data
        $userAttempts = $attempts->groupBy('user_id');
        $passed = 0;
        $failed = 0;

        // --- Compute total possible score ---
        $totalScore = 0;
        foreach ($test->questions as $question) {
            $data = json_decode($question->BlockData, true);
            if (is_array($data) && isset($data['points'])) {
                $totalScore += $data['points'];
            }
        }

        $totalPossibleScore = max($totalScore, 1);
        $passing = $test->passing_rate;

        // --- Evaluate pass/fail per user ---
        foreach ($userAttempts as $attemptGroup) {
            $bestScore = $attemptGroup->max('score');
            $percentage = ($bestScore / $totalPossibleScore) * 100;

            if ($percentage >= $passing) {
                $passed++;
            } else {
                $failed++;
            }
        }

        // --- Build detailed user results ---
        $takers = $userAttempts->map(function ($attempts) use ($totalPossibleScore, $passing) {
            $bestAttempt = $attempts->sortByDesc('score')->first();
            $percentage = ($bestAttempt->score / $totalPossibleScore) * 100;
            $status = $percentage >= $passing ? 'Passed' : 'Failed';

            return [
                'user' => new UserInfoResource($bestAttempt->user),
                'best_score' => $bestAttempt->score,
                'percentage' => round($percentage, 2),
                'status' => $status,
                'questions' => $bestAttempt->questions,
            ];
        })->values();

        // --- Compute average attempt count ---
        $attemptCount = $attempts->count();
        $attemptCountPerUser = $test->attempts()
            ->where('is_completed', true)
            ->whereIn('user_id', $userAttempts->keys())
            ->select('user_id', DB::raw('COUNT(*) as total_attempts'))
            ->groupBy('user_id')
            ->get();

        $uniqueUserCount = max($attemptCountPerUser->count(), 1);

        // ✅ Construct final response
        $test->total_takers = $userAttempts->count();
        $test->passed = $passed;
        $test->failed = $failed;
        $test->takers = $takers;
        $test->average_attemptCount = round($attemptCount / $uniqueUserCount, 2);

        return response()->json($test);

    }

    public function searchSelfEnrollment($type, Request $request){
        $searchTerm = $request->input('q');
        $perPage = $request->input('per_page', 12);
        $userId = $request->user()->userInfos->id;

        // $query = Course::with([
        // 'categories',
        // 'lessons',
        // 'attachments',
        // 'tests',
        // 'tests.questions',
        // 'career_level',
        // 'author',
        // 'author.userCredentials'
        // ])
        // ->whereNotIn('status', ['archived', 'for_archived'])
        // ->where(function ($q) use ($searchTerm) {
        //     $q->where('courseName', 'ILIKE', "%{$searchTerm}%")
        //     ->orWhere('courseID', 'ILIKE', "%{$searchTerm}%")
        //     ->orWhere('overview', 'ILIKE', "%{$searchTerm}%")
        //     ->orWhere('objective', 'ILIKE', "%{$searchTerm}%");
        // });
        // $query->whereNotIn('status', ['archived', 'for_archived']);

        // if ($type === 'pending') {
        // $query->whereHas('userSelfEnrollRequests', function ($q) use ($userId) {
        //     $q->where('self_enrollment_requests.user_id', $userId)
        //         ->where('self_enrollment_requests.status', 'pending');

        // });
        // } else {
        //     $query->whereDoesntHave('enrollments', function ($query) use ($userId){
        //         $query->where('user_id', $userId);
        //     })
        //     ->whereDoesntHave('selfEnrollRequests', function ($query) use ($userId){
        //         $query->where('user_id', $userId);
        //     });
        // }


        // $results = $query->paginate($perPage);

        if ($type === 'pending') {
            // Get pending self-enrollment requests for the current user
            $requests = \App\Models\SelfEnrollmentRequest::with([
                'course.categories',
                'course.lessons',
                'course.attachments',
                'course.tests',
                'course.tests.questions',
                'course.career_level',
                'course.author',
                'course.author.userCredentials'
            ])
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->whereHas('course', function ($q) use ($searchTerm) {
                $q->where('courseName', 'ILIKE', "%{$searchTerm}%")
                ->orWhere('courseID', 'ILIKE', "%{$searchTerm}%")
                ->orWhere('overview', 'ILIKE', "%{$searchTerm}%")
                ->orWhere('objective', 'ILIKE', "%{$searchTerm}%")
                ->whereNotIn('status', ['archived', 'for_archived']);
            })
            ->paginate($perPage);

            // Map to include both course data and request data
            $mapped = $requests->getCollection()->map(function ($r) {
                $course = $r->course;
                return [
                    ...$course->toArray(),
                    'start_date' => $r->start_date,
                    'end_date' => $r->end_date,
                    'request_id' => $r->id,
                    'request_status' => $r->status,
                ];
            });

            // Replace paginator collection with the mapped data
            $requests->setCollection($mapped);

            // Return structured JSON response
            return response()->json([
                'currentPage' => $requests->currentPage(),
                'data' => $requests->items(),
                'lastPage' => $requests->lastPage(),
                'total' => $requests->total(),
            ], 200);
        }

        // For available (non-pending) courses
        $query = Course::with([
            'categories',
            'lessons',
            'attachments',
            'tests',
            'tests.questions',
            'career_level',
            'author',
            'author.userCredentials'
        ])
        ->whereNotIn('status', ['archived', 'for_archived'])
        ->where(function ($q) use ($searchTerm) {
            $q->where('courseName', 'ILIKE', "%{$searchTerm}%")
            ->orWhere('courseID', 'ILIKE', "%{$searchTerm}%")
            ->orWhere('overview', 'ILIKE', "%{$searchTerm}%")
            ->orWhere('objective', 'ILIKE', "%{$searchTerm}%");
        })
        ->whereDoesntHave('enrollments', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })
        ->whereDoesntHave('userSelfEnrollRequests', function ($q) use ($userId) {
            $q->where('self_enrollment_requests.user_id', $userId)
            ->where('self_enrollment_requests.status', 'pending');
        });

        $results = $query->paginate($perPage);

        // Same JSON structure for consistency
        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);

    }

    public function courseStatistics() {
        $courses = Course::with(['categories', 'types', 'career_level', 'enrollments'])->get();
        $courses->makeHidden(['enrollments']);
        foreach ($courses as $course) {
            if ($course->enrollments->isEmpty()) {
                $course->total_learners = 0;
                $course->completionData = [
                    ['passed' => 0, 'failed' => 0, 'notFinished' => 0],
                ];
                $course->onTimeCompletionData = [
                    ['onTime' => 0, 'late' => 0, 'notFinished' => 0],
                ];

                $course->learner_timeline = $course->enrollmentstatuscount()->get();
                continue;
            }

            $totalLearners = $course->enrollments()->count();

            $passed = $course->enrollments()
                ->whereIn('enrollment_status', ['finished', 'late_finish'])
                ->count();

            $failed = $course->enrollments()
                ->where('enrollment_status', 'failed')
                ->count();

            $onTimeCompletions = $course->enrollments()
                ->where('enrollment_status', 'finished')
                ->count();

            $lateCompletions = $course->enrollments()
                ->where('enrollment_status', 'late_finish')
                ->count();

            $course->total_learners = $totalLearners;
            $course->completionData = [
                [
                    'passed' => $passed,
                    'failed' => $failed,
                    'notFinished' => $totalLearners - ($passed + $failed),
                ],
            ];
            $course->onTimeCompletionData = [
                ['onTime' => $onTimeCompletions,
                'late' => $lateCompletions,
                'notFinished' => $totalLearners - ($onTimeCompletions + $lateCompletions),]
            ];

            $course->ratings = [
                'completionRate' => $totalLearners > 0 ? round(($passed / $totalLearners) * 100, 2) : 0,
                'onTimeCompletionRate' => ($onTimeCompletions + $lateCompletions) > 0 ? round(($onTimeCompletions / ($onTimeCompletions + $lateCompletions)) * 100, 2) : 0,
            ];

            $course->learner_timeline = $course->enrollmentstatuscount()->get();
        }

        return $courses;
    }

}

