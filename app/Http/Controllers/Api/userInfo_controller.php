<?php

namespace App\Http\Controllers\Api;

use App\Events\BulkUserAddedEvent;
use App\Events\NewNotification;
use App\Events\TestEvent;
use App\Events\UserAddedEvent;
use App\Filters\CourseFilter;
use App\Filters\CourseSort;
use App\Filters\UserInfosFilter;
use App\helpers\LessonCountHelper;
use App\helpers\LogActivityHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\AddUsersRequest;
use App\Http\Requests\ArchiveRestoreDeleteUserRequest;
use App\Http\Requests\BulkAssignCourseAdmins;
use App\Http\Requests\BulkStoreUserRequest;
use App\Http\Requests\SelfEnrollRequest;
use App\Http\Requests\TestAnswersRequest;
use App\Http\Requests\TestArrayRequest;
use App\Http\Requests\updateUserInfo;
use App\Http\Requests\UserInfoSearchRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\UserCredentialsResource;
use App\Http\Resources\UserInfoResource;
use App\Jobs\BulkAddUsers;
use App\Jobs\PermissionToUser;
use App\Jobs\PermissionToUserSingle;
use App\Jobs\ResetOptionCache;
use App\Jobs\testjob;
use App\Models\Branch;
use App\Models\CarouselImage;
use App\Models\certificate_userinfo;
use App\Models\Course;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\CourseUserAssigned;
use App\Models\Department;
use App\Models\Division;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Permission;
use App\Models\Question;
use App\Models\Role;
use App\Models\Section;
use App\Models\SelfEnrollmentRequest;
use App\Models\Subgroup;
use App\Models\Test;
use App\Models\Title;
use App\Models\Type;
use App\Models\User_Test_Attempt;
use App\Models\UserInfos;
use App\Notifications\BulkAddDoneNotification;
use App\Notifications\BulkAddNotification;
use App\Notifications\BulkUserAddedNotification;
use App\Notifications\CourseCompletion;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Models\UserCredentials;
use App\Notifications\AccountChangeNotification;
use App\Notifications\NotifyAssignedCourseAdmin;
use App\Notifications\NotifyCourseAdminsForApproval;
use App\Notifications\TestNotification;
use App\Notifications\WelcomeToMBLearnNotification;
use App\Services\PhilSMSService;
use App\Services\UserLogService;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon as SupportCarbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;



class userInfo_controller extends Controller
{

    //Add user information function
    //Change, only have 1 request that has information for both the userinfos and usercreds
    public function addUser(AddUsersRequest $addUsersRequest){

        $existingatedData = $addUsersRequest->validated();
        \Log::info($existingatedData);

        if(UserInfos::where('employeeID', $existingatedData['employeeID'])->exists()){
            return response()->json([
                'message' => 'User already exists',
            ], 409);
        }

        if(UserCredentials::where('MBemail', $existingatedData['MBemail'])->exists()){
            return response()->json([
                'message' => 'User creds already exists',
            ], 409);
        }

        // Combine first name, middle initial, last name, and suffix into a full name
        $fullName = trim("{$existingatedData['first_name']} " .
                            ("{$existingatedData['middle_name']}" ? "{$existingatedData['middle_name']}. " : "") .
                            "{$existingatedData['last_name']} " );

        // Generate profile image URL (pass the correct name variable)
        $profile_image = $this->generateProfileImageUrl($fullName);

        $options = Cache::get('options');
        $title =  Title::with('department.division')->find($existingatedData['title_id']);
        $branch = $options['location']->firstWhere('id', $existingatedData['branch_id']);

        $status = $existingatedData['status'] ?? 'Active';

        $userCredentials = new UserCredentials([
            'MBemail' => strtolower($existingatedData['MBemail']),
            'password' => $existingatedData['password'],
        ]);

        $userInfo = new UserInfos([
            'employeeID' => $existingatedData['employeeID'],
            'first_name' => $existingatedData['first_name'],
            'last_name' => $existingatedData['last_name'],
            'middle_name' => $existingatedData['middle_name'],
            'status' =>$status,
            'profile_image' =>$profile_image
        ]);

        $userInfo->branch()->associate($branch);
        $userInfo->title()->associate($title);
        $userInfo->save();
        $userInfo->roles()->sync($existingatedData['role_id']);
        $userCredentials->save();
        $userCredentials->userInfos()->save($userInfo);



        if($existingatedData['permissions'] ?? false){
            PermissionToUser::dispatch($userInfo, $existingatedData['permissions'] ?? []);
        }
        $user = $addUsersRequest->user();
        UserAddedEvent::broadcast($user->email, 1);

        return response()->json([
            'message' => 'User registered successfully',
            'user_info' => $userInfo,
            'permissions' => $existingatedData['permissions'] ?? false
        ], 201);
    }


    public function newStoreUser(AddUsersRequest $request, UserLogService $log){
        $validatedUser = $request->validated();

        if(UserInfos::where('employeeID', $validatedUser['employeeID'])->exists()){
            return response()->json([
                'message' => 'User already exists',
            ], 409);
        }

        if(UserCredentials::where('MBemail', $validatedUser['MBemail'])->exists()){
            return response()->json([
                'message' => 'User creds already exists',
            ], 409);
        }

        $fullName = trim("{$validatedUser['first_name']} " .
                            ("{$validatedUser['middle_name']}" ? "{$validatedUser['middle_name']}. " : "") .
                            "{$validatedUser['last_name']} ");

        $pfp = $this->generateProfileImageUrl($fullName);

        // $options = Cache::get('options');
        // $title= $options['titles']->firstWhere('id', $validatedUser['title_id']);
        // $branch= $options['location']->firstWhere('id', $validatedUser['branch_id']);
            // \Log::info(Title::with('department.division')->find($validatedUser['title_id'])->toArray());
        $status = $validatedUser['status'] ?? 'Active';
        $title = Title::find($validatedUser['title_id']);
        $branch = Branch::find($validatedUser['branch_id']);

        $credentials = new UserCredentials([
            'MBemail' => strtolower($validatedUser['MBemail']),
            'password' => $validatedUser['password'],
            'first_log_in' => true,
        ]);
        $credentials->save();

        $infos = new UserInfos([
            'employeeID' => $validatedUser['employeeID'],
            'first_name' => $validatedUser['first_name'],
            'last_name' => $validatedUser['last_name'],
            'middle_name' => $validatedUser['middle_name'],
            'status' =>$status,
            'profile_image' =>$pfp,
            'user_credentials_id' => $credentials->id,
        ]);

        $infos->branch()->associate($branch);
        $infos->title()->associate($title);
        $infos->save();

        if(!empty($validatedUser['role_id'])){
            $infos->roles()->sync([$validatedUser['role_id']]);
        }

        $credentials->userInfos()->save($infos);

        $credentials->notify(new WelcomeToMBLearnNotification($infos->first_name, $infos->middle_name, $infos->last_name, $validatedUser['MBemail'], $validatedUser['password']));

        if(!empty($validatedUser['permissions'])){
            PermissionToUserSingle::dispatch($infos, $validatedUser['permissions'] ?? []);
        }

        $currentUser = $request->user()->userInfos;
        $log->log(
            $currentUser->id,
            "AddedUser",
            "Added 1 user, name: ".$fullName,
            $request->ip()
        );

        return response()->json([
            'message' => 'User registered successfully',
            'user_info' => $infos,
            'permissions' => $validatedUser['permissions'] ?? []
        ], 201);
    }

    public function fetchtUserByDepartment($ID){
        $user = UserInfos::whereHas('title.division', function ($q) use ($ID) {
            $q->where('department_id', $ID);
        })->with(['roles', 'branch', 'branch.city', 'title', 'title.careerLevel', 'title.division','title.division.department'])->get();

        return response()->json([
            'data' => $user
        ]);
    }

    public function bulkStoreUsers(BulkStoreUserRequest $bulkStoreUserRequest){
        $bulk = $bulkStoreUserRequest->validated();
        $user = $bulkStoreUserRequest->user();
        BulkAddUsers::dispatch($bulk, $user->MBemail, count($bulk), $user->userInfos->id, $bulkStoreUserRequest->ip());
        return response()->json([
            'data' => 'Added to Queue'
        ]);
    }

    public function UserInfoSearch(UserInfoSearchRequest $request){
        $search = $request['search'];
        $perPage = $request->input('perPage', 5); //Number of entry per page
        $page = $request->input('page', 1);//Default page
        $status = $request['status'] ?? 'Active';
        $course_id = $request['course_id'] ?? null;
        $relation = $request['relation'] ?? 'enrollments';
        $result = UserInfos::search($search);

        if(!$course_id){
            $result = $result->query(function($query) use ($status) {
                $query->where('status', '=', $status)
                    ->with(['roles', 'division','department', 'title', 'branch', 'city']);
                return $query;
            })->paginate($perPage);

        }else{
            $result = $result->query(function($query) use($status, $course_id, $relation){
                if($relation == 'enrolled'){
                    $query->where('status', '=', $status)
                        ->whereHas('enrollments', function($subquery) use ($course_id){
                            $subquery->where('course_id', '=', $course_id);
                        })
                        ->with(['roles', 'division','department', 'title', 'branch', 'city']);
                    return $query;
                } else if($relation == 'assigned'){
                    $query->where('status', '=', $status)
                        ->whereHas('assignedCourses', function($subquery) use ($course_id){
                            $subquery->where('courses.id', '=', $course_id);
                        })
                        ->with(['roles', 'division','department', 'title', 'branch', 'city']);
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

    /**
    * Generate a default profile image URL based on the user's name
    */
    private function generateProfileImageurl($name){
        return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&color=ffffff&background=03045e&bold=true&size=400';
    }

    /**
     * Fetch all user entries from the UserInfo table.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexUsers(Request $request, $status){

        Gate::authorize('viewAny', UserInfos::class);
        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page
        $user_id = $request->user()->userInfos->id;

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder,$request);

        $users =  UserInfoResource::collection(
            $queryItems->where('status', '=', $status)
            ->where('id', '!=', $user_id)
            ->whereDoesntHave('permissions', function($query){
                $query->where('permission_name', 'Root');
            })
            ->with('roles','title','title.department.division','title.careerLevel','branch','city','userCredentials')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
        );

        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'lastPage' => $users->lastPage(),
            'currentPage' => $users->currentPage(),
        ],200);
    }

public function indexAvailableCourseAdmins(Request $request, ZCompELearnCreatedCourse $course)
{
    // Match the Course model using CourseID from ZCompELearnCreatedCourse
    $matchedCourse = Course::where('courseID', $course->CourseID)->first();

    if (!$matchedCourse) {
        return response()->json([
            'error' => 'Matching Course not found.',
        ], 404);
    }

    Log::info('Matching course found:', [
        'zcomp_course_id' => $course->id,
        'CourseID' => $course->CourseID,
        'matched_course_model_id' => $matchedCourse->id,
    ]);

    $filter = new UserInfosFilter();
    $builder = UserInfos::query();
    $queryItems = $filter->transform($builder, $request);

    $users = $queryItems
        ->whereHas('roles', function(Builder $query){
            $query->whereIn('role_name', ['Course Admin', 'System Admin']);
        })
        ->whereNot(function (Builder $query){
            $query->whereHas('permissions', function(Builder $q) {
                $q->where('permission_name', 'Root');
            });
        })
        ->whereDoesntHave('assignedCourses', function ($query) use ($matchedCourse) {
            $query->where('courses.id', $matchedCourse->id);
        })
        ->where('status', 'Active')
        ->with('roles','title.department.division','department','title','branch','city')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'data' => $users,
    ], 200);
}
    public function indexAssignedCourseAdmins(Request $request, ZCompELearnCreatedCourse $course)
    {
        $matchedCourse = Course::where('courseID', $course->CourseID)->first();

        if (!$matchedCourse) {
            return response()->json([
                'error' => 'Matching Course not found.',
            ], 404);
        }

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);

        $users = $queryItems
            ->whereHas('roles', function (Builder $query) {
                $query->whereIn('role_name', ['Course Admin', 'System Admin']);
            })
            ->whereNot(function (Builder $query) {
                $query->whereHas('permissions', function (Builder $q) {
                    $q->where('permission_name', 'Root');
                });
            })
            ->whereHas('assignedCourses', function ($query) use ($matchedCourse) {
                $query->where('courses.id', $matchedCourse->id);
            })
            ->where('status', 'Active')
            ->with('roles', 'title.department.division', 'department', 'title', 'branch', 'city')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $users,
        ], 200);
    }

    public function indexEnrollingUsers(Request $request, Course $course){
        $isAssigned = $course->assignedCourseAdmins()->where('user_id', '=',  auth()->user()->userInfos->id)->exists();
        if(!$isAssigned){
            return response()->json(['message' => 'You are not assigned to this course'], 403);
        };

        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',4); //Number of entry per page
        $currUser = $request->user()->userInfos;

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);
        $users = UserInfoResource::collection(
                $queryItems
                ->whereHas('roles', function(Builder $query){
                    $query->where('role_name', 'Course Admin')
                        ->orWhere('role_name', "System Admin")
                        ->orWhere('role_name', "Learner");
                })
                ->whereNot('id', $currUser->id)
                // ->whereDoesntHave('enrollments.course', function ($query) use($course) {
                //     $query->where('courses.id', $course->id)
                //         // ->whereIn('enrollment_status', 'failed');
                //         ->whereIn('enrollment_status', ['enrolled', 'finished', 'ingoing','failed','late-finish']);
                // })
                ->whereDoesntHave('enrollments.course', function ($query) use($course) {
                    $query->where('courses.id', $course->id);
                })
                ->whereNot(function (Builder $query){
                    $query->whereHas('permissions', function(Builder $q) {
                        $q->where('permission_name', 'Root');
                    });
                })
                ->where('status', 'Active')
                ->with('roles', 'title.department.division','career_level')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
            );

        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'lastPage' => $users->lastPage(),
            'currentPage' => $users->currentPage(),
        ],200);
    }

    public function indexFailedEnrollingUsers(Request $request, Course $course){
        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',4); //Number of entry per page
        $currUser = $request->user()->userInfos;

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);
        $users = UserInfoResource::collection(
            $queryItems->whereHas('roles', function(Builder $query){
                $query->where('role_name', 'Course Admin')
                    ->orWhere('role_name', "System Admin")
                    ->orWhere('role_name', "Learner");
            })
            // ->whereDoesntHave('enrollments.course', function ($query) use($course) {
            //     $query->where('courses.id', $course->id)
            //         // ->whereIn('enrollment_status', 'failed');
            //         ->whereIn('enrollment_status', ['enrolled', 'finished', 'ingoing','failed','late-finish']);
            // })
            ->whereHas('enrollments.course', function ($query) use($course) {
                $query->where('courses.id', $course->id)
                    ->where('enrollment_status', 'failed');
            })
            ->whereDoesntHave('enrollments.course', function($query) use ($course){
                $query->where('courses.id', $course->id)
                    ->where('enrollment_status', '!=', 'failed');
            })
            ->whereNot(function (Builder $query){
                $query->whereHas('permissions', function(Builder $q) {
                    $q->where('permission_name', 'Root');
                });
            })
            ->where('status', 'Active')
            ->with('roles', 'title', 'career_level')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
        );

        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'lastPage' => $users->lastPage(),
            'currentPage' => $users->currentPage(),
        ],200);
    }

    public function getAssignedCourses(UserInfos $userInfos, Request $request){

        $filterData = [
            'page' => $request->input('page', 1),
            'perPage' => $request->input('perPage', 6),
            'type_id' => $request->input('type_id'),
            'category_id' => $request->input('category_id'),
            'training_type' => $request->input('training_type'),
        ];
        $cacheKey = 'userInfo'.$userInfos->id.':assignedCourses:'.json_encode($filterData);

        if(!Cache::has($cacheKey)){
            $courses = Cache::remember($cacheKey, now(), function() use ($userInfos, $request, $filterData){
                $page = $filterData['page'];
                $perPage = $filterData['perPage'];

                $sort = new CourseSort();
                $filter = new CourseFilter();
                $builder = $userInfos->assignedCourses();
                $querySort = $sort->transform($builder, $request);
                $queryfilter = $filter->transform($querySort, $request);

                $paginate = $queryfilter->with(['categories', 'lessons', 'attachments', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])
                    ->where('status', '!=', 'archived')
                    ->paginate($perPage, ['*'], 'page', $page);
                return $paginate;
            });

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

            return response() -> json([
                'data' => $courses->items(),
                'total' => $courses->total(),
                'lastPage' => $courses->lastPage(),
                'currentPage' => $courses->currentPage(),
            ]);
        }

        $test = Cache::get($cacheKey);
        $test = LessonCountHelper::getEnrollmentStatusCount($test);

        return response() -> json([
            'data' => $test->items(),
            'total' => $test->total(),
            'lastPage' => $test->lastPage(),
            'currentPage' => $test->currentPage(),
        ]);
    }

    public function indexArchivedUsers(Request $request){
        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page
        $currentUserId = $request->user()->userInfos->id;

        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);

        $users =  $queryItems
                ->where('status', '=', 'Inactive')
                ->whereNot(function($query) use ($currentUserId){
                    $query->where('id', $currentUserId);
                })
                ->whereNot(function (Builder $query){
                    $query->whereHas('permissions', function(Builder $q) {
                        $q->where('permission_name', 'Root');
                    });
                })
                ->orderBy('created_at', 'desc')
                ->with('roles','division','department','title','branch','city')
                ->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'total' => $users->total(),
            'lastPage' => $users->lastPage(),
            'currentPage' => $users->currentPage()
        ],200);
    }

    public function indexNotLearnerUsers(Request $request){
        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);
        $perPage = $request->input('perPage',5); //Number of entry per page
        $user_id = $request->user()->id;
        $admins = $queryItems
        ->whereHas('roles',function($query){
            $query->where('role_name', '=', 'Course Admin');
        })->whereNot(function (Builder $query) use ($user_id){
            $query->where('id', $user_id);
        })
        ->whereNot(function (Builder $query){
            $query->whereHas('permissions', function(Builder $q) {
                $q->where('permission_name', 'Root');
            });
        })
        ->where('status', '=', 'Active')
        ->orderBy('created_at', 'desc')
        ->with('roles','division','department','title','branch','city')
        ->paginate($perPage);

        return response()->json([
            'data' => $admins->items(),
            'total' => $admins->total(),
            'lastPage' => $admins->lastPage(),
            'currentPage' => $admins->currentPage()
        ]);
    }

    public function getAddedCourses(UserInfos $userInfos,Request $request){
        $filterData = [
            'page' => $request->input('page', 1),
            'perPage' => $request->input('perPage', 6),
            'type_id' => $request->input('type_id'),
            'category_id' => $request->input('category_id'),
            'training_type' => $request->input('training_type'),
        ];
        $cacheKey = 'userInfo'.$userInfos->id.':addedCourses:'.json_encode($filterData);

        if(!Cache::has($cacheKey)){
            $courses = Cache::remember($cacheKey, now(), function() use ($userInfos, $request, $filterData){
                $page = $filterData['page'];
                $perPage = $filterData['perPage'];

                $sort = new CourseSort();
                $filter = new CourseFilter();
                $builder = $userInfos->addedCourses();
                $querySort = $sort->transform($builder, $request);
                $queryfilter = $filter->transform($querySort, $request);

                $paginate = $queryfilter->with(['categories', 'types', 'training_modes','adder','lessons'])
                    ->where('archived', '=', 'active')
                    ->paginate($perPage);

                foreach($paginate as $course){
                    if($course->lessonCount() > 0){
                        $course->progress = round($userInfos->lessonsCompletedCount($course->id)/$course->lessonCount() * 100, 2);
                    }else{
                        $course->progress = 0;
                    }
                    $course->deadline = Enrollment::query()
                        ->where('user_id', '=', $userInfos->id)
                        ->where('course_id', '=', $course->id)
                        ->pluck('end_date')
                        ->first();
                }

                return $paginate;
            });

            $courses = LessonCountHelper::getEnrollmentStatusCount($courses);
            return response() -> json([
                'data' => $courses->items(),
                'total' => $courses->total(),
                'lastPage' => $courses->lastPage(),
                'currentPage' => $courses->currentPage(),
            ]);
        }

        $test = Cache::get($cacheKey);
        $test = LessonCountHelper::getEnrollmentStatusCount($test);

        return response() -> json([
            'data' => $test->items(),
            'total' => $test->total(),
            'lastPage' => $test->lastPage(),
            'currentPage' => $test->currentPage(),
        ]);
    }

    //You add user id then role id in url /addRole/{userInfos}/{role}
    public function addRole(UserInfos $userInfos, Role $role){
        $userInfos->roles()->syncWithoutDetaching($role->id);
        return response()->json([
            "Message" => "Role Added",
            "Data" => $userInfos,
            "Roles" => $userInfos->roles,
        ]);
    }

    public function removeRole(UserInfos $userInfos, Role $role){
        $userInfos->roles()->detach($role->id);
        return response()->json([
            "Message" => "Role Removed",
            "Data" => $userInfos,
            "Roles" => $userInfos->roles,
        ]);
    }

    public function addPermission(UserInfos $userInfos, Permission $permission){
        $userInfos->permissions()->attach($permission->id);
        return response()->json([
            "Message" => "Permission Added",
            "Data" => $userInfos
        ]);
    }

    public function RemovePermission(UserInfos $userInfos, Permission $permission){
        $userInfos->permissions()->detach($permission->id);
        return response()->json([
            "Message" => "Permission Removed",
            "Data" => $userInfos
        ]);
    }

    public function addBranch(UserInfos $userInfos, Branch $branch){
        $userInfos->branch()->associate($branch);
        $userInfos->save();
        return response()->json([
            "Message" => "Branch Attached",
            "Data" => $userInfos,
            "branch" => $userInfos->branch,
        ]);
    }

    public function removeBranch(UserInfos $userInfos, Branch $branch){
        $userInfos->branch()->disassociate();
        $userInfos->save();
        return response()->json([
            "Message" => "Branch removed",
            "Data" => $userInfos,
            "branch" => $userInfos->branch,
        ]);
    }

    public function addTitle(UserInfos $userInfos, Title $title){
        $userInfos->title()->associate($title);
        $userInfos->save();
        return response()->json([
            "Message" => "Title Attached",
            "Data" => $userInfos,
            "title" => $userInfos->title,
        ]);
    }

    public function removeTitle(UserInfos $userInfos, Title $title){
        $userInfos->title()->disassociate();
        $userInfos->save();
        return response()->json([
            "Message" => "Title removed",
            "Data" => $userInfos,
            "title" => $userInfos->title,
        ]);
    }

    //Need update to this counter --gio--
    public function enrollmentStatusCount(UserInfos $userInfos){
        $enrolled = 0;
        $ongoing = 0;
        $finished = 0;

        $enrollments = $userInfos->enrollments()->get();
        foreach($enrollments as $enrollment){
            if($enrollment->enrollment_status == "enrolled"){
                $enrolled += 1;
            }else if($enrollment->enrollment_status == "ongoing"){
                $ongoing += 1;
            }else if($enrollment->enrollment_status == "finished"){
                $finished += 1;
            }
        }
        return response()->json([
            'enrolled_count' => $enrolled,
            'ongoing_count' => $ongoing,
            'finished_count' => $finished
        ]);
    }

    public function getUserCourses(UserInfos $userInfos, Request $request){
        $filterData = [
            'page' => $request->input('page', 1),
            'perPage' => $request->input('perPage', 6),
            'type_id' => $request->input('type_id'),
            'category_id' => $request->input('category_id'),
            'training_type' => $request->input('training_type'),
            'enrollment_status' => $request->input('enrollment_status'),
        ];


        $page = $filterData['page'];
        $perPage = $filterData['perPage'];

        $sort = new CourseSort();
        $filter = new CourseFilter();
        $builder = $userInfos->enrolledCourses();
        $querySort = $sort->transform($builder, $request);
        $queryfilter = $filter->transform($querySort, $request);

        if(!empty($filterData['enrollment_status']) && $filterData['enrollment_status'] != ""){
            $queryfilter->whereHas('enrollments', function($subQuery) use ($filterData, $userInfos){
                $subQuery->where('user_id', $userInfos->id)->where('enrollment_status', $filterData['enrollment_status']);
            });
            $queryfilter = $queryfilter->wherePivot('enrollment_status', $filterData['enrollment_status']);
        }

        $courses = $queryfilter->with(['categories','attachments','lessons', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])
            ->where('status', '=', 'active')
            ->paginate($perPage);

        foreach($courses as $course){
            if($course->lessonCount() > 0){
                $course->progress = round($userInfos->completedModules($course->id, $course->pivot->id)/$course->modulesCount() * 100, 2);
                Log::info('Pivot key' , ['enrollment_id' => $course->pivot->id]);
            }else{
                $course->progress = 0;
            }
            $course->deadline = $course->pivot->end_date;
            $course->doneModules = $userInfos->moduleCompleted($course->id, $course->pivot->id);
            $course->enrollmentStatus = $course->pivot->enrollment_status;
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

    public function getUserOngoingCourses(UserInfos $userInfos){
        $user = $userInfos->find($userInfos->id);
        $courses = $user->enrolledCourses()
            ->whereHas('enrollments', fn($q) =>
            $q ->where('user_id', $user->id)
            ->where('enrollment_status', 'ongoing'))->with(['categories','attachments','lessons', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])->get();
        foreach($courses as $course){
            $course->doneModules = $user->moduleCompleted($course->id, $course->pivot->enrollment_id);
            $course->modules = $course->modulesCount();
            $course->enrollmentStatus = $course->pivot->enrollment_status;
        }
        return response()->json([
            'data' => $courses,
        ], 200);
    }

    /**
     * Display the specified user info.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function findUser(UserInfos $userInfos)
    {
        // Find the user info by ID
        $user = UserInfos::with(['city', 'branch', 'department', 'title', 'roles', 'userCredentials']) // Added 'roles'
        ->find($userInfos->id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'data' => $user,
            'city' => $user->city,
            'branch' => $user->branch,
            'department' => $user->department,
            'title' => $user->title,
            'credentials' => $user->userCredential,
            'roles' => $user->roles, // Include roles in the response
        ]);
    }

    //Find User using employeeID
    public function findUser_EmployeeID($employeeID)
    {
        // Find the user info by Employee ID
        $user = UserInfos::where('employeeID', $employeeID)
        ->with('roles')
        ->first();

        if($user){
            return response() -> json(['data' => $user], 200);
        }else {
            return response()->json(['message' => 'User not found'], 404);  // Return error if not found
        }
    }

    /**
     * Update the specified user info.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateUser(UserInfos $userInfos, updateUserInfo $request, UserLogService $log){
        if(!$userInfos){
            return response()->json(['message' => 'User not found'], 404);
        }

        $curruser = $request->user()->userInfos;
        $changes = [];
        if($curruser->hasPermission('Root')){
            //Input Validation
            $existingatedData = $request->validated();
            $old = $userInfos->only(['employeeID', 'first_name', 'last_name', 'middle_name', 'name_suffix', 'title_id', 'branch_id', 'image']);
            $file = $request->file('image');
            $path = "";
            if($file){
                $path = $file->store('/'.$userInfos->id, 'profiles');
            }
            if(!$userInfos){
                return response()->json(['message' => 'User not found'], 404);
            }
            $userInfos->update($existingatedData);
            if(!$path === ""){
                $userInfos->update(["profile_image" => $path]);
            }
            $userInfos->refresh();
            $new = $userInfos->only(['employeeID', 'first_name', 'last_name', 'middle_name', 'name_suffix', 'title_id', 'branch_id', 'image']);
            foreach($new as $key => $value){
                if($old[$key] !== $value){
                    $changes[$key] = $value;
                }
            }
            $userInfos->userCredentials->notify(new AccountChangeNotification($changes, $curruser));
            $log->log($curruser->id, 'Update user info', 'Updated '.$userInfos->fullName().' user information', $request->ip());
            //Update UserInfo
            return response()->json([
                "Message" => 'Updated User',
                "Data" => $userInfos
            ]);
        }

        //not root user
        if(!$userInfos->hasPermission('Root')){
            $existingatedData = $request->validated();
            $old = $userInfos->only(['employeeID', 'first_name', 'last_name', 'middle_name', 'name_suffix', 'title_id', 'branch_id', 'image']);
            $file = $request->file('image');
            $path = "";
            if($file){
                $path = $file->store('/'.$userInfos->id, 'profiles');
            }
            $userInfos->update($existingatedData);
            if(!$path === ""){
                $userInfos->update(["profile_image" => $path]);
            }
            $new = $userInfos->only(['employeeID', 'first_name', 'last_name', 'middle_name', 'name_suffix', 'title_id', 'branch_id', 'image']);
            foreach($new as $key => $value){
                if($old[$key] !== $value){
                    $changes[$key] = $value;
                }
            }
            $userInfos->refresh();
            $userInfos->userCredentials->notify(new AccountChangeNotification($changes, $curruser));
            $log->log($curruser->id, 'Update user info', 'Updated '.$userInfos->fullName().' user information', $request->ip());
            //IF USER(PERSON UPDATING) DOESNT HAVE ROOT PERMS THEN CAN'T UPDATE A ROOT USER
            return response()->json([
                "Message" => 'Updated User',
                "Data" => $userInfos
            ]);
        }
        return response()->json([
            "Message" => "Cannot update user",
        ],403);
    }

    //Delete User
    public function deleteUser(UserInfos $userInfos, Request $request, UserLogService $log)
    {
        Gate::authorize('delete', UserInfos::class);
        $currUser = $request->user()->userInfos;
        if($userInfos->hasPermission("Root")){
            return response()->json(['message' => 'User not found'], 404);
        }
        if($userInfos->hasPermission("Senior")){
            if(!$currUser->hasPermission("Root")){
                return response()->json(['message' => 'No permission to delete user'], 401);
            }
        }
        if($userInfos){
            $userInfos->status = "Inactive";
            $userInfos->save();
            $log->log($currUser->id, 'UserArchive', $currUser->fullName().' has archived '.$userInfos->fullName(), $request->ip());
            return response()->json(['message' => 'User is now set to inactive'], 200);
        }else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }

    public function archiveRestoreDeleteUsers(ArchiveRestoreDeleteUserRequest $request, UserLogService $log){
        $validated = $request->validated();
        $action = $validated['action'];

        $query = UserInfos::query()->whereIn('id', array_column($validated['data'], 'id'));

        $namesArray = [];

        switch($action){
            case "archive":
                $query->update(['status' => 'Inactive']);
                $namesArray = $query->get()->map(fn($user) => $user->fullName())->toArray();
                break;
            case "restore":
                $query->update(['status' => 'Active']);
                $namesArray = $query->get()->map(fn($user) => $user->fullName())->toArray();
                break;
            case "delete":
                $namesArray = $query->where('status', 'Inactive')->get()->map(fn($user) => $user->fullName())->toArray();
                $query->delete();
                UserCredentials::whereHas('userInfos', fn($q) => $q->whereIn('id', array_column($validated['data'], 'id')))->delete();
        }
        $names = implode(', ', $namesArray);
        $currentUser = $request->user()->userInfos;
        $log->log(
            $currentUser->id,
            $action."d users",
            $currentUser->fullName()." has ".$action."d [$names]",
            $request->ip(),
        );

        return response()->json([
            'message' => "[$names] has been ".$action."d.",
        ]);
    }

    public function hardDeleteUser(UserInfos $user, Request $request, UserLogService $log){
        if(!($user->status === "Inactive")){
            return response()->json(['message' => 'User is not inactive']);
        }
        $userCreds = $user->userCredentials;
        $user->delete();
        $userCreds->delete();
        $currentUser = $request->user();
        $currentUserInfos = $currentUser->userInfos;
        $log->log(
            $currentUserInfos->id,
            "HardDeleteUser",
            $currentUserInfos->fullName()." has hard deleted ".$user->fullName(),
            $request->ip(),
        );

        return response()->json(['Message' => "User has been hard deleted from the system"]);
    }

    public function restoreUser($id, Request $request, UserLogService $log)
    {
        $userInfos = UserInfos::find($id);
        $userInfos->status = "Active";
        $userInfos->save();
        $currentUser = $request->user()->userInfos;
        $log->log($currentUser->id, 'RestoreUser', $currentUser->fullName().' has restored '.$userInfos->fullName(), $request->ip());


        return  response()->json([
            'data' => $userInfos
        ]);
    }

    //Truncate
    // public function resetUser()
    // {
    //     // Truncate the users table
    //     DB::table('userInfo')->truncate();
    //     return response()->json(['message' => 'User Info table reset successfully!'], 200);
    // }

    //Fetch UserProfilePhoto for the UserCredentials
    public function getProfile(Request $request)
    {
        $page = $request->input('page', 1);//Default page
        $perPage = $request->input('perPage',5); //Number of entry per page

        $profile_image = UserInfos::select('profile_image','employeeID')->paginate($perPage);
        return response()->json([
            'data' => $profile_image->items(),
            'total' => $profile_image->total(),
            'lastPage' => $profile_image->lastPage(),
            'currentPage' => $profile_image->currentPage()
        ],200);
    }

    public function fetchRoleDistribution(){
        $totalUsers = UserInfos::count();
        // $systemAdminCount = UserInfos::whereHas('roles', function ($query) {
        //     $query->where('roles.id', '1');
        // })->count();
        // $systemAdminPercent = round(($systemAdminCount / $totalUsers) * 100, 2);

        // $courseAdminCount = UserInfos::whereHas('roles', function ($query) {
        //     $query->where('roles.id', '2');
        // })->count();
        // $courseAdminPercent = round(($courseAdminCount / $totalUsers) * 100, 2);

        // $learnerCount = UserInfos::whereHas('roles', function ($query) {
        //     $query->where('roles.id', '3');
        // })->count();
        // $learnerPercent = round(($learnerCount / $totalUsers) * 100, 2);

        // $smeCount = UserInfos::whereHas('roles', function ($query) {
        //     $query->where('roles.id', '4');
        // })->count();
        // $smePercent = round(($smeCount / $totalUsers) * 100, 2);

        $SystemAdmins = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '1');
        })->count();
        $CourseAdmins = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '2');
        })->count();
        $Learners = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '3');
        })->count();
        $SME_Creator = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '4');
        })->count();
        $SME_Viewer = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '5');
        })->count();
        $SME_Distributor = UserInfos::whereHas('roles', function ($query) {
            $query->where('roles.id', '6');
        })->count();

        return response()->json([
            'total' => $totalUsers,
            'System_Admin' => $SystemAdmins,
            'Course_Admin' => $CourseAdmins,
            'Learner' => $Learners,
            'SME_Creator' => $SME_Creator,
            'SME_Viewer' => $SME_Viewer,
            'SME_Distributor' => $SME_Distributor,
        ]);
    }

    public function getUserEvents (Request $request){
        $user = $request->user()->userInfos->id;

        //$events = Enrollment::with(['course:id,name'])->where('user_id', $user)->select('id', 'course_id', 'start_date', 'end_date', 'enrollment_status');
            $enrollements =  Enrollment::with(['course:id,name'])->where('user_id', $user)->whereDate('end_date','>=',now())->select('start_date','course_id')->get();
            $deadlines =  Enrollment::with(['course:id,name'])->where('user_id', $user)->whereDate('end_date','>=',now())->select('end_date','course_id')->get();
        return response() -> json([
            'enrollements' => $enrollements,
            'deadlines' => $deadlines
        ], 200);
    }

    public function getEnrolledUserDashboard (Request $request){
        $user = $request->user()->userInfo->id;


    }

    public function test(Request $request){
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
            return (object) [
                'employeeID' => $user->employeeID,
                'user' => $user->fullName(),
                'status' => $subs[$user->enrollment_status],
                'start_date' => $user->start_date,
                'end_date' => $user->end_date,
                'updated_at' => $user->updated_at
            ];
        });
        $statusCount = [
            "passed_count" => $enrolledUsers->where('pivot.enrollment_status', 'finished')->count(),
            "failed_count" => $enrolledUsers->where('pivot.enrollment_status', 'failed')->count(),
            "on_time" => $enrolledUsers->where('pivot.enrollment_status', 'finished')->filter(fn($e) => Carbon::parse($e->updated_at)->lessThanOrEqualTo(Carbon::parse($e->end_date)))->count(),
            "late" => $enrolledUsers->where('pivot.enrollment_status', 'late_finish')->count(),
        ];
        $chunked = $finalUsers->chunk(4);
        return [
                'name' => 'Course Completion Report',
                'date' => now()->format('Y-m-d'),
                'genby' => $request->user_name ?? 'System Generated',
                'usedFor' => 'courseCompletion',
                'scope' => 'All finished users of course',
                'entries' => $chunked,
                'course' => $course,
                'statusCount' => $statusCount,
        ];
    }



    public function getEnrollmentStatus ($userInfos, $course) {
        $enrollmentStatus = Enrollment::where('user_id', $userInfos)->where('course_id', $course)->first();
        return response()->json($enrollmentStatus, 200);
    }

    public function searchEmployee(Request $request, $status) {
        $searchTerm = $request->input('q');
        $per_page = $request->input('perPage', 5);
        $currentUserId = $request->user()->userInfos->id;

        $results = UserInfos::query()
                    ->where('id', '!=', $currentUserId)
                    ->with(['roles','title','title.department.division','title.careerLevel','branch','city','userCredentials'])
                    ->where('status', $status)
                    ->where(function ($q) use ($searchTerm) {
                        $q->where('first_name', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                        ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                        ->orWhereHas('title', function ($q) use ($searchTerm) {
                            $q->where('title_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('career_level', function ($q) use ($searchTerm) {
                            $q->where('name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('title.department', function ($q) use ($searchTerm) {
                            $q->where('department_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('title.department.division', function ($q) use ($searchTerm) {
                            $q->where('division_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('branch', function ($q) use ($searchTerm) {
                            $q->where('branch_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('branch.city', function ($q) use ($searchTerm) {
                            $q->where('city_name', 'ILIKE', "%{$searchTerm}%");
                        })->orWhereHas('roles', function ($q) use ($searchTerm) {
                            $q->where('role_name', 'ILIKE', "%{$searchTerm}%");
                        });
                    })
                    ->paginate($per_page);


        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);
    }

    public function searchAssignedCourse(UserInfos $userInfos, Request $request) {
        $searchTerm = $request->input('q');
        $per_page = $request->input('perPage', 5);

        $results = $userInfos->assignedCourses()
                    ->with(['categories', 'lessons', 'attachments', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])
                    ->where(function ($q) use ($searchTerm){
                        $q->where('courses.courseName', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('courses.courseID', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('courses.training_type', 'ILIKE', "%{$searchTerm}%")
                        ->orWhereHas('categories', function ($q) use ($searchTerm) {
                            $q->where('category_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('career_level', function ($q) use ($searchTerm) {
                            $q->where('name', 'ILIKE', "%{$searchTerm}%");
                        });
                    })->paginate($per_page);

        foreach ($results as $course) {
            if ($course->archival->isNotEmpty()) {
                $latestArchival = $course->archival->sortByDesc('WillArchiveAt')->first();
                $course->archival_date = $latestArchival;
            } else {
                $course->archival_date = null;
            }
        }

        $results = LessonCountHelper::getEnrollmentStatusCount($results);
        $results = CourseResource::collection($results);


        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);
    }

    public function searchEnrolledCourse(UserInfos $userInfos, Request $request) {
        $searchTerm = $request->input('q');
        $EnrollmentStatus = $request->input('enrollment_status', null);
        $page = $request->input('page', 1);
        $per_page = $request->input('perPage', 5);

        $results = $userInfos->enrolledCourses()
                    ->with(['categories', 'lessons', 'attachments', 'tests', 'tests.questions','career_level', 'author', 'author.userCredentials'])
                    ->where(function ($q) use ($searchTerm){
                        $q->where('courses.courseName', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('courses.courseID', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('courses.training_type', 'ILIKE', "%{$searchTerm}%")
                        ->orWhereHas('categories', function ($q) use ($searchTerm) {
                            $q->where('category_name', 'ILIKE', "%{$searchTerm}%");
                        })
                        ->orWhereHas('career_level', function ($q) use ($searchTerm) {
                            $q->where('name', 'ILIKE', "%{$searchTerm}%");
                        });
                    })->when($EnrollmentStatus, function ($query, $EnrollmentStatus) use ($userInfos) {
                        $query->whereHas('enrollments', function($subQuery) use ($EnrollmentStatus, $userInfos){
                            $subQuery->where('user_id', $userInfos->id)
                                     ->where('enrollment_status', $EnrollmentStatus);
                        });
                    })->paginate($per_page);


        foreach($results as $course){
            $enrollment = Enrollment::query()
                ->where('user_id', '=', $userInfos->id)
                ->where('course_id', '=', $course->id)
                ->first();

            $course->progress = round($userInfos->completedModules($course->id)/$course->modulesCount() * 100, 2);
            $course->deadline = $enrollment ? $enrollment->end_date : null;
            $course->doneModules = $userInfos->moduleCompleted($course->id, $enrollment->id);
            $course->enrollmentStatus = $enrollment ? $enrollment->enrollment_status : null;
            $course->modules = $course->modulesCount();
            $course->modules_count = $course->modulesCount();
        }

        LessonCountHelper::getEnrollmentStatusCount($results);

        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);
    }

    public function searchEnrollees(Course $course, Request $request) {
        $IsAssigner = $course->assignedCourseAdmins()->where('user_id', Auth::user()->userInfos->id)->exists();
        if(!$IsAssigner){
            return response()->json([
                'message' => 'Unauthorized to view enrollees',
            ], 403);
        }

        $searchTerm = $request->input('q');
        $per_page = $request->input('perPage', 5);
        $type = $request->input('type', 'not_enrolled'); // Default to 'not_enrolled' if not provided

        if($type === 'request'){
            $query = $course->selfEnrollRequests()
                ->with(['user', 'user.title.department.division', 'user.branch.city', 'user.career_level', 'user.roles', 'user.userCredentials'])
                ->where('status', 'pending')
                ->whereHas('user', function ($q) use ($searchTerm) {
                    $q
                    ->whereNot('id', Auth::user()->userInfos->id)
                    ->where('status', 'Active')
                    ->where(function ($query) use ($searchTerm) {
                        $query->where('first_name', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                            ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                            ->orWhereHas('title', fn($q) => $q->where('title_name', 'ILIKE', "%{$searchTerm}%"))
                            ->orWhereHas('career_level', fn($q) => $q->where('name', 'ILIKE', "%{$searchTerm}%"))
                            ->orWhereHas('title.department.division', fn($q) => $q->where('division_name', 'ILIKE', "%{$searchTerm}%"))
                            ->orWhereHas('title.department', fn($q) => $q->where('department_name', 'ILIKE', "%{$searchTerm}%"))
                            ->orWhereHas('branch', fn($q) => $q->where('branch_name', 'ILIKE', "%{$searchTerm}%"))
                            ->orWhereHas('branch.city', fn($q) => $q->where('city_name', 'ILIKE', "%{$searchTerm}%"));
                    });
                })
                ->paginate($per_page);

            // 🔹 Transform results to flatten user + request details
            $query->getCollection()->transform(function ($req) {
                $user = $req->user;
                $user->request_id = $req->id;
                $user->start_date = $req->start_date;
                $user->end_date = $req->end_date;
                $user->request_status = $req->status;
                return $user;
            });

            return response()->json([
                'type' => 'selfenrollment',
                'currentPage' => $query->currentPage(),
                'data' => $query->items(),
                'lastPage' => $query->lastPage(),
                'total' => $query->total(),
            ]);
        } else if($type === 'retake'){
        $filter = new UserInfosFilter();
        $builder = UserInfos::query();
        $queryItems = $filter->transform($builder, $request);

        $users = $queryItems
            ->whereHas('roles', function (Builder $query) {
                $query->whereIn('role_name', ['Course Admin', 'System Admin', 'Learner']);
            })
            ->whereHas('enrollments.course', function ($query) use ($course) {
                $query->where('courses.id', $course->id)
                    ->where('enrollment_status', 'failed');
            })
            ->whereDoesntHave('enrollments.course', function ($query) use ($course) {
                $query->where('courses.id', $course->id)
                    ->where('enrollment_status', '!=', 'failed');
            })
            ->whereNot(function (Builder $query) {
                $query->whereHas('permissions', function (Builder $q) {
                    $q->where('permission_name', 'Root');
                });
            })
            ->where('status', 'Active')
            ->with(['roles', 'title.division.department', 'career_level', 'branch', 'branch.city'])
            ->where(function ($query) use ($searchTerm) {
                $query
                        ->whereNot('id', Auth::user()->userInfos->id)
                        ->where('first_name', 'ILIKE', "%{$searchTerm}%")
                      ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                      ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                      ->orWhereHas('title', fn($q) => $q->where('title_name', 'ILIKE', "%{$searchTerm}%"))
                      ->orWhereHas('career_level', fn($q) => $q->where('name', 'ILIKE', "%{$searchTerm}%"))
                      ->orWhereHas('title.department.division', fn($q) => $q->where('division_name', 'ILIKE', "%{$searchTerm}%"))
                      ->orWhereHas('title.department', fn($q) => $q->where('department_name', 'ILIKE', "%{$searchTerm}%"))
                      ->orWhereHas('branch', fn($q) => $q->where('branch_name', 'ILIKE', "%{$searchTerm}%"))
                      ->orWhereHas('branch.city', fn($q) => $q->where('city_name', 'ILIKE', "%{$searchTerm}%"));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return response()->json([
            'type' => 'retake',
            'currentPage' => $users->currentPage(),
            'data' => $users->items(),
            'lastPage' => $users->lastPage(),
            'total' => $users->total(),
        ]);
        }
            $results = UserInfos::query()
                        ->with(['title', 'title.department.division', 'branch', 'branch.city', 'career_level', 'roles', 'userCredentials'])
                        ->where('status', 'Active')
                        ->whereNot('id', Auth::user()->userInfos->id)
                        ->whereHas('roles', function($query){
                            $query->where('role_name', 'Course Admin')
                                ->orWhere('role_name', "System Admin")
                                ->orWhere('role_name', "Learner");
                        })->whereDoesntHave('enrolledCourses', function ($query) use($course) {
                            $query->where('courses.id', $course->id);
                        })->where(function  ($query) use ($searchTerm){
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
                        })->paginate($per_page);


        return response()->json([
            'currentPage' => $results->currentPage(),
            'data' => $results->items(),
            'lastPage' => $results->lastPage(),
            'total' => $results->total(),
        ], 200);
    }

    // public function notificate(){
    //     $adder = UserCredentials::find(102);

    //     $adder->notify(new CourseCompletion());
    //     return response()->json([
    //         "Message" => "Notification Sent"
    //     ]);
    // }

    public function getRequest(Request $request) {
        $user = Auth::user();

        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $requests = SelfEnrollmentRequest::with([
            'course.attachments',
            'course.author.userCredentials',
            'course.career_level',
            'course.categories',
            'course.lessons',
            'course.tests',
        ])
        ->where('user_id', $user->userInfos->id)
        ->where('status', 'pending')
        ->get();

        $mapped = $requests->map(function ($r) {
            $course = $r->course;
            return [
                ...$course->toArray(),
                'start_date' => $r->start_date,
                'end_date' => $r->end_date,
                'request_id' => $r->id,
            ];
        });

        $total = $mapped->count();
        $paged = new LengthAwarePaginator(
            $mapped->forPage($page, $perPage),
            $total,
            $perPage,
            $request->input('page', 1),
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json([
            'data' => $paged->items(),
            'total' => $paged->total(),
            'lastPage' => $paged->lastPage(),
            'currentPage' => $paged->currentPage(),
        ]);
    }

    public function getCourseRequested($request){
        // $request = SelfEnrollmentRequest::where('course_id', $course)
        // ->where('user_id', Auth::user()->userInfos->id)
        // ->where('status', 'pending')
        // ->with('course.attachments',
        //         'course.author.userCredentials',
        //         'course.career_level',
        //         'course.categories',
        //         'course.lessons',
        //         'course.tests',)
        // ->get();
        $req = SelfEnrollmentRequest::with([
            'course.attachments',
            'course.author.userCredentials',
            'course.career_level',
            'course.categories',
            'course.lessons',
            'course.tests',
        ])->findOrFail($request);

        // Access the related course
        $course = $req->course;

        return response()->json([
            ...$course->toArray(),
            'start_date' => $req->start_date,
            'end_date' => $req->end_date,
        ]);
    }

    public function LearnerActivities(){
        $user = Auth::user()->userInfos;

        $activities = Enrollment::where('user_id', $user->id)->whereNotIn('enrollment_status', ['finished', 'late_finish','failed', 'archived'])
                                ->select('enrollment_status', DB::raw('count(*) as total'))
                                ->groupBy('enrollment_status')
                                ->pluck('total', 'enrollment_status');

        return response()->json( $activities);
    }

    public function getEvents(Request $request) {
        $user = $request->user()->userInfos->id;
        $eventType = $request->input('type', 'all'); // 'enrollment', 'deadline', or 'all'

        $events = Enrollment::with('course')
        ->where('user_id', $user)
        ->whereDate('end_date', '>=', now())
        ->get()
        ->flatMap(function ($enrollment) use ($eventType) {
            $items = [];

            if ($eventType === 'enrollment' || $eventType === 'all') {
                $items[] = [
                    'type' => 'enrollment',
                    'date' => $enrollment->start_date,
                    'course' => $enrollment->course->courseName,
                ];
            }

            if ($eventType === 'deadline' || $eventType === 'all') {
                $items[] = [
                    'type' => 'deadline',
                    'date' => $enrollment->end_date,
                    'course' => $enrollment->course->courseName,
                ];
            }

            return $items;
        })
        ->values();
        // ->get(['start_date','end_date','course_id'])
        // ->flatMap(function ($enrollment){
        //     return [
        //         [
        //             'type' => 'enrollment',
        //             'date' => $enrollment->start_date,
        //             'course' => $enrollment->course
        //         ],
        //         [
        //             'type' => 'deadline',
        //             'date' => $enrollment->end_date,
        //             'course' => $enrollment->course
        //         ]
        //         ];
        // })->values();
        return response()->json([
            'events' => $events
        ], 200);
    }

    public function learnerWithCourses(Request $request){

        $page = $request->input('page', 1);
        $per_page = $request->input('perPage', 10);

        $learners = UserInfos::with(['enrolledCourses', 'title.department.division', 'roles', 'title.careerLevel','userCredentials'])
            ->paginate($per_page);

        $learners->getCollection()->transform(function ($learner) {
            $learner->enrolledCourses->map(function ($course) use ($learner) {
                $course->pivot->progress = round($learner->completedModules($course->id) / $course->modulesCount() * 100, 2);
                return $course;
            });
            return $learner;
        });

        return response()->json([
            'currentPage' => $learners->currentPage(),
            'data' => $learners->items(),
            'lastPage' => $learners->lastPage(),
            'total' => $learners->total(),
        ],200);
    }

    public function searchLearner(Request $request){
        $searchTerm = $request->input('q');
        $per_page = $request->input('perPage', 10);
        $page = $request->input('page', 1);
        $currentUserId = $request->user()->userInfos->id ?? null; // optional, if needed

        $query = UserInfos::query()
        ->when($currentUserId, fn($q) => $q->where('id', '!=', $currentUserId))
        ->with([
            'enrolledCourses',
            'title.department.division',
            'roles',
            'title.careerLevel',
            'userCredentials',
            'branch.city'
        ]);

        if (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'ILIKE', "%{$searchTerm}%")
                    ->orWhere('last_name', 'ILIKE', "%{$searchTerm}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$searchTerm}%"])
                    ->orWhere('employeeID', 'ILIKE', "%{$searchTerm}%")
                    ->orWhereHas('roles', fn($r) => $r->where('role_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title', fn($t) => $t->where('title_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title.careerLevel', fn($c) => $c->where('name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title.department', fn($d) => $d->where('department_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('title.department.division', fn($div) => $div->where('division_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('branch', fn($b) => $b->where('branch_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('branch.city', fn($city) => $city->where('city_name', 'ILIKE', "%{$searchTerm}%"))
                    ->orWhereHas('userCredentials', fn($u) => $u->where('MBemail', 'ILIKE', "%{$searchTerm}%"));
            });
        }

        $learners = $query->paginate($per_page);

        $learners->getCollection()->transform(function ($learner) {
            $learner->enrolledCourses->map(function ($course) use ($learner) {
                $modulesCount = $course->modulesCount() ?: 1;
                $learner->progress = round($learner->completedModules($course->id) / $modulesCount * 100, 2);
                $course->pivot->progress = $learner->progress;
                return $course;
            });
            return $learner;
        });

        return response()->json([
            'currentPage' => $learners->currentPage(),
            'data' => $learners->items(),
            'lastPage' => $learners->lastPage(),
            'total' => $learners->total(),
        ], 200);


    }

}
