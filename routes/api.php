<?php


use App\Events\fAsRead;
use App\Events\NotificationsMarkedAsRead;
use App\Http\Controllers\Api\ActivityLogsController;
use App\Http\Controllers\Api\ArchiveCourseController;
use App\Http\Controllers\Api\CareerLevelController;
use App\Http\Controllers\Api\CarouselImageController;
use App\Http\Controllers\Api\CourseContextController;
use App\Http\Controllers\Api\FilterOptionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OptionController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\LoginStatsController;
use App\Http\Controllers\RecentlyOpenedCourseController;
use App\Models\Enrollment;
use App\Models\UserCredentials;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZConnectCompELearnCreatedCourses;
use App\Notifications\TestNotification;
use App\Services\GmailService;
use Barryvdh\DomPDF\Facade\Pdf;
use Google\Service\Forms\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CompECourseController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardStatsController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\userInfo_controller;
use App\Http\Controllers\Api\userCredentials_controller;
use App\Http\Controllers\Api\FilterCategoryController;
use App\Http\Controllers\Api\FormInputController;
use App\Http\Controllers\Api\LessonsController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\SubgroupController;
use App\Http\Controllers\Api\TitleController;
use App\Http\Controllers\Api\TypeController;
use App\Http\Controllers\Api\ReportGenController;
use App\Http\Controllers\Api\SelfEnrollmentController;
use App\Models\UserInfos;


use App\Http\Controllers\CompELearnController\ZCourseAttachmentController;
use App\Http\Controllers\CompELearnController\ZCourseCertificateController;

use App\Http\Controllers\CompELearnController\Dashboard\ZDashboardController;

use App\Http\Controllers\CompELearnController\Course\ZCourseController;
use App\Http\Controllers\CompELearnController\Course\ZConnectDeletedCourse;
use App\Http\Controllers\CompELearnController\Course\ZonnectReviewerCourseController;
use App\Http\Controllers\CompELearnController\Course\ZconnectCreatedCourseController;
use App\Http\Controllers\CompELearnController\Course\RecentCourseController;
use App\Http\Controllers\CompELearnController\Course\ZConnectCourseVersionHistory;
use App\Http\Controllers\CompELearnController\Course\ZConnectDistributorController;

use App\Http\Controllers\CompELearnController\Lesson\ZLessonController;
use App\Http\Controllers\CompELearnController\Test\ZTestController;

use App\Http\Controllers\CompELearnController\Permission\ZCoursePermissionController;

use App\Http\Controllers\CompELearnController\CourseCreation\CourseCreationController;

use App\Http\Controllers\CompELearnController\Utilities\CourseSearchController;
use App\Http\Controllers\CompELearnController\Notification\ZNotificationController;
use App\Http\Controllers\CompELearnController\UserReports\ZUserReportsController;
use App\Http\Controllers\Api\CourseAssessmentStatsController;
use App\Http\Controllers\Api\ResetController;
use App\Http\Resources\UserCredentialsResource;
use App\Models\CarouselImage;
use Illuminate\Support\Facades\Log;

//New Login routing
Route::post('/verifyOtp', [AuthController::class, 'verifyOtp']);
Route::post('/reqOtp',[AuthController::class, 'requestOTP']);
Route::post('/reqOTPEmailResetPassword', [AuthController::class, 'requestOTPEmailResetPassword']);
Route::post('/verifyOtpResetPassword', [AuthController::class, 'verifyOTPResetPassword']);
Route::post('/reqOTPSMS', [AuthController::class, 'requestOTPSMS']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
Route::post('/reset-passowrd-request', [AuthController::class, 'reqResetPassword']);
//Protected Routes
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        //$AuthenticatedUser = $request->user()->load(['userInfos', 'userInfos.city','userInfos.permissions','userInfos.roles','userInfos.branch', 'userInfos.title.department.division', 'userInfos.title.careerLevel']);
        $AuthenticatedUser = UserCredentials::with([
            'userInfos',
            'userInfos.city',
            'userInfos.permissions',
            'userInfos.roles',
            'userInfos.branch',
            'userInfos.title.department.division',
            'userInfos.title.careerLevel'
        ])->find($request->user()->id);

        $AuthenticatedUser->makeVisible(['phone_number']);

        // return $AuthenticatedUser->only(['id'])+['user_infos' => $AuthenticatedUser->userInfos];

        //Events
        // $events = [];
        $events = Enrollment::with(['course:id,courseName as name'])
        ->where('user_id', $AuthenticatedUser->userInfos->id)
        ->whereDate('end_date','>=',now())
        ->get(['start_date','end_date','course_id'])
        ->flatMap(function ($enrollment){
            return [
                [
                    'type' => 'enrollment',
                    'date' => $enrollment->start_date,
                    'course' => $enrollment->course
                ],
                [
                    'type' => 'deadline',
                    'date' => $enrollment->end_date,
                    'course' => $enrollment->course
                ]
                ];
        })->values();


        //User Activities
        $enrolled = 0;
        $ongoing = 0;
        $past_due = 0;
        $finished = 0;

        // $Activities = Enrollment::where('user_id', $AuthenticatedUser->userInfos->id)->get();
        // foreach($Activities as $entry){
        //     if($entry->end_date < now() && $entry->enrollment_status !== "finished"){
        //         $past_due++;
        //     } elseif($entry->enrollment_status == "ongoing"){
        //         $ongoing++;
        //     } else if($entry->enrollment_status == "finished"){
        //         $finished++;
        //     } else {
        //         $enrolled++;
        //     }
        // };



        return response()->json([
            'AuthenticatedUser' => new UserCredentialsResource($AuthenticatedUser),
            'unread_Notifications' => $AuthenticatedUser->unreadNotifications()->count(),
            'events' => $events,
            'activities' => [
                'enrolled' => $enrolled,
                'ongoing' => $ongoing,
                'past_due' => $past_due
            ]
        ]);
    });

    Route::put('/resetProgress/{user}/{course}', [ResetController::class, 'resetLearner']);

    Route::get('dashboard/courseAdmin', [CourseController::class, 'courseAdminActivities']);
    Route::get('/userEvents', [userInfo_controller::class, 'getEvents']);

    Route::get('/search-employee/{status}', [userInfo_controller::class, 'searchEmployee']);
    Route::get('/search-cred', [userCredentials_controller::class, 'searchUserCredentials']);
    Route::get('/search-Enrolledcourse/{userInfos}', [userInfo_controller::class, 'searchEnrolledCourse']);
    Route::get('/search-Assignedcourse/{userInfos}', [userInfo_controller::class, 'searchAssignedCourse']);
    Route::get('/search-enrollees/{course}', [userInfo_controller::class, 'searchEnrollees']);
    Route::get('/search-CourseLearner/{course}', [CourseController::class, 'seacrhEnrolledLearner']);
    Route::get('dashboard/courseAdmin', [CourseController::class, 'courseAdminActivities']);


    Route::get('getPendingEnrollment', [userInfo_controller::class, 'getRequest']);
    Route::get('getRequestCourse/{request}',[userInfo_controller::class, 'getCourseRequested']);

    Route::post('/otp-phone-number', [AuthController::class, 'validatePhoneNumber']);
    Route::post('/save-phone-number', [AuthController::class, 'SavePhoneNumber']);


    Route::get('/system-uptime', function() {
        $seconds = (int) shell_exec("awk '{print int($1)}' /proc/uptime");

        $weeks = floor($seconds / 604800); // 7 * 24 * 60 * 60
        $days = floor(($seconds % 604800) / 86400);
        $hours = floor(($seconds % 86400) / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        $formatted = sprintf('%02d:%02d:%02d:%02d', $weeks, $days, $hours, $minutes);

        return response()->json([
            'uptime' => $formatted,
        ]);
    });

    Route::get('/exists/{courseId}', [CourseController::class, 'checkIfExist']);
    Route::get('/fetch_stats',[userInfo_controller::class, 'fetchRoleDistribution']);
    Route::get('/dailies', [LoginStatsController::class, 'dailies']);
    Route::get('/getUserEvents', [userInfo_controller::class, 'getUserEvents']);
    Route::post('/records/{course}', [RecentlyOpenedCourseController::class, 'record']);
    Route::get('/records', [RecentlyOpenedCourseController::class, 'getRecent']);
    Route::post('learner/records/{course}', [RecentlyOpenedCourseController::class, 'learnerRecord']);
    Route::get('/learner/records', [RecentlyOpenedCourseController::class, 'getRecentOpenedCoursesLearner']);
    Route::get('/learner/activities', [userInfo_controller::class, 'LearnerActivities']);



    //Relationships API
    Route::post('/addRole/{userInfos}/{role}', [userInfo_controller::class, 'addRole']);
    Route::post('/removeRole/{userInfos}/{role}', [userInfo_controller::class, 'removeRole']);
    Route::post('/addPermission/{userInfos}/{permission}', [userInfo_controller::class, 'addPermission']);
    Route::post('removePermission/{userInfos}/{permission}', [userInfo_controller::class, 'removePermission']);
    Route::post('/add-users-department/{userInfos}/{department}', [userInfo_controller::class, 'addDepartment']);
    Route::post('/add-users-branch/{userInfos}/{branch}', [userInfo_controller::class, 'addBranch']);
    Route::post('/add-branch-city', [BranchController::class, 'addCity']);
    Route::post('/addType/{course}/{type}', [CourseController::class, 'addType']);
    Route::post('/removeType/{course}/{type}', [CourseController::class, 'removeType']);
    Route::post('/addCategory/{course}/{category}', [CourseController::class, 'addCategory']);
    Route::post('/removeCategory/{course}/{category}', [CourseController::class, 'removeCategory']);
    
    //User API
    Route::post('/add-many-users', [userInfo_controller::class, 'bulkStoreUsers']);
    Route::post('/add-user', [userInfo_controller::class, 'newStoreUser']);
    Route::get('/index-user/{status}',[userInfo_controller::class, 'indexUsers']);
    Route::get('/index-archived-users', [userInfo_controller::class, 'indexArchivedUsers']);
    Route::get('/index-course-admins', [userInfo_controller::class, 'indexNotLearnerUsers']);
    Route::get('/select-user/{userInfos}', [userInfo_controller::class, 'findUser']);
    Route::get('/select-employeeid/{employeeID}',[userInfo_controller::class, 'findUser_EmployeeID']);
    Route::put('/update-user-info/{userInfos}',[userInfo_controller::class, 'updateUser']);
    Route::delete('/delete-user/{userInfos}',[userInfo_controller::class, 'deleteUser']);
    Route::put('/restore-user/{id}', [userInfo_controller::class, 'restoreUser']);
    Route::get('/user-search', [userInfo_controller::class, 'UserInfoSearch']);
    Route::get('/search-enrollees/{course}', [userInfo_controller::class, 'searchEnrollees']);
    Route::get('/search-CourseLearner/{course}', [CourseController::class, 'seacrhEnrolledLearner']);
    Route::get('/search-employee/{status}', [userInfo_controller::class, 'searchEmployee']);
    Route::get('/search-cred', [userCredentials_controller::class, 'searchUserCredentials']);
    Route::post('/bulk-archive-restore-delete-users', [userInfo_controller::class, 'archiveRestoreDeleteUsers']);

    Route::post('/addusercredentials', [userCredentials_controller::class, 'addUserCredentials']);
    //Route::put('/update-user-creds/{userCredentials}',[userCredentials_controller::class, 'updateUserCredentials']);
    Route::put('/update-user-credentials/{userCredentials}', [userCredentials_controller::class, 'updateUserCredentials']);
    Route::get('/index-user-creds',[userCredentials_controller::class, 'userCredentialsList']);
    Route::get('/index-user-creds/inactive',[userCredentials_controller::class, 'UnuserCredentialsList']);
    Route::get('/select-user-creds/{userCredentials}',[userCredentials_controller::class, 'findUser_Creds']);
    Route::delete('/delete-user-creds/{userCredentials}',[userCredentials_controller::class, 'deleteUser']);
    // Route::get('/reset-user-creds',[userCredentials_controller::class, 'resetUsers']); //reset user table
    Route::get('get-profile-image',[userInfo_controller::class, 'getProfile']); //Get Profile Image for UserCredentials
    Route::get('/select-user-creds/{employeeID}',[userCredentials_controller::class, 'findUser_EmployeeID']);
    Route::put('/reset-password/{userCredentials}', [userCredentials_controller::class, 'resetUserPassword']);
    Route::put('/change-user-password/{userCredentials}', [userCredentials_controller::class, 'changePassword']);
    Route::put('/store-phone-number/{userCredentials}', [userCredentials_controller::class, 'StorePhoneNumber']);
    Route::put('/restore-user-creds/{userCredentials}', [userCredentials_controller::class, 'restoreUser']);
    // Route::get('/reset-user',[userInfo_controller::class, 'resetUser']); //reset user table

    //User with course API
    Route::get('/select-user-courses/{userInfos}', [userInfo_controller::class, 'getUserCourses']); //Note: This is for the Learner Course Manager
    Route::get('/select-user-ongoing-courses/{userInfos}', [userInfo_controller::class, 'getUserOngoingCourses']); //Note: This is for the Learner Dashboard
    Route::get('/getEnrollmentStatus/{userInfos}/{course}', [userInfo_controller::class, 'getEnrollmentStatus']);
    Route::get('/select-course-users/{course}', [CourseController::class, 'getCourseUsers']);
    Route::get('/enrollment-status-count/{userInfos}', [CourseController::class, 'countCourseStatus']);
    Route::get('/select-user-assigned-courses/{userInfos}', [userInfo_controller::class, 'getAssignedCourses']);
    Route::get('/select-user-added-courses/{userInfos}', [userInfo_controller::class, 'getAddedCourses']);
    Route::post('/courses/bulk', [CourseController::class, 'bulkStore']);
    Route::get('/assigned-course-admins/{course}', [CourseController::class, 'getAssignedCourseAdmin']);
    Route::get('/select-user-enrollment-status/{userInfos}', [userInfo_controller::class, 'enrollmentStatusCount']);
    Route::delete('/delete-enrolled-user/{userInfos}/{course}', [CourseController::class, 'removeEnrolledUser']);
    Route::get('/publish-course/{course}', [CourseController::class, 'publishCourse']);
    Route::get('/select-course-selfenrollment-requests/{course}', [SelfEnrollmentController::class, 'CourseSelfEnrollmnentRequests']);
    Route::get('/search-Assignedcourse/{userInfos}', [userInfo_controller::class, 'searchAssignedCourse']);
    Route::get('/search-Enrolledcourse/{userInfos}', [userInfo_controller::class, 'searchEnrolledCourse']);
    Route::get('/searchSelfEnrollment/{type}', [CourseController::class, 'searchSelfEnrollment']);
    Route::get('/alert-learners/{course}', [EnrollmentController::class, 'AlertLearners']);
    Route::get('/coursesStatistics', [CourseController::class, 'courseStatistics']);
    Route::get('/getLearners', [userInfo_controller::class, 'learnerWithCourses']);
    Route::get('/searchLearners', [userInfo_controller::class, 'searchLearner']);


    Route::get('/course/timeline/{course]', [CourseController::class, 'courseTimeline']);
    Route::get('/course/certifiedLearners/{course}', [CourseController::class, 'certifiedLearners']);
    Route::get('/course/certifiedLearnerPerDepartment/{course}', [CourseController::class, 'certifiedLearnersPerDepartment']);
    Route::get('/course/assessmentOverview/{course}', [CourseController::class, 'courseAssessmentOverview']);

    //USER TEST ATTEMPTS
    Route::post('/takeTest/{test}', [TestController::class, 'getResult']);
    Route::get('/select-user-test-attempt-answers/{user}/{test}/{attemptNumber}', [TestController::class, 'getAttemptAnswers']);
    Route::get('/total-user-test-attempts/{userid}/{testid}', [TestController::class, 'getTotalAttempts']);
    Route::get('/finalizeAssessment/{test}', [TestController::class, 'currentAssessmentStatus']);
    Route::get('getAllAssessmentResults/{course}',[TestController::class, 'getAssessmentResults']);

    Route::put('/editTest/{id}',[TestController::class, 'editTest']);


    //Enrollment API
    Route::post('/enrollments/bulk', [EnrollmentController::class, 'bulk']);
    Route::apiResource('/enrollments', EnrollmentController::class);
    Route::get('/index-user/enrolees', [EnrollmentController:: class, 'enrolees']);
    Route::get('/index-user-enrollments/{course}', [userInfo_controller::class, 'indexEnrollingUsers']);
    Route::get('/index-failed-user-enrollments/{course}', [userInfo_controller::class, 'indexFailedEnrollingUsers']);
    Route::post('/enrollments/self/bulk', [SelfEnrollmentController::class, 'selfEnroll']);
    Route::post('/enrollments/self/approval', [SelfEnrollmentController::class, 'ResolveRequest']);
    Route::delete('/enrollment/remove/{enrollment}', [EnrollmentController::class, 'RemoveEnrollment']);
    Route::put('/enrollment/move-end-date/{enrollment}',[EnrollmentController::class, 'extendEnrollment']);
    Route::get('/test/{id}/{userInfos}', [CourseContextController::class, 'getProgress']);

    Route::get('getLearnersCompletedStatistic/{course}', [CourseController::class, 'completedLearners']);
    Route::get('/getLearningTimelineStatistic/{course}', [DashboardStatsController::class, 'CourseTimeline']);
    Route::get('getAssessmentStatistic/{course}', [CourseController::class, 'assessmentPerformance']);
    Route::get('filteredAssessmentStatistic/{course}/{test}', [CourseController::class, 'getassessmentPerformance']);

    //IDK MAN REPORTS OR SOMETHING
    Route::get('/courses/completionrates/{course}', [DashboardStatsController::class, 'completionRates']);
    Route::get('/courses/ontime/{course}', [DashboardStatsController::class, 'onTimeNotOnTime']);
    Route::get('/courses/totallearners/{course}', [DashboardStatsController::class, 'totalLearners']);
    Route::get('/courses/assessmentstats/{course}', [CourseAssessmentStatsController::class, 'perCourseAssessment']);


    //Form Input API
    Route::apiResource('/courses', CourseController::class);
    Route::apiResource('/categories', CategoryController::class);
    Route::post('/categories/bulk', [CategoryController::class, 'bulkStore']);
    Route::apiResource('/types', TypeController::class);
    Route::post('types/bulk', [TypeController::class, 'bulkStore']);
    Route::post('/cities/bulk', [CityController::class, 'bulkStore']);
    Route::post('/departments/bulk', [DepartmentController::class, 'bulkStore']);
    Route::post('/branches/bulk', [BranchController::class, 'bulkStore']);
    Route::post('/titles/bulk', [TitleController::class, 'bulkStore']);
    Route::post('/divisions/bulk', [DivisionController::class, 'bulkStore']);
    Route::apiResource('/permissions', PermissionController::class);
    Route::apiResource('/career-levels', CareerLevelController::class);
    Route::post('/title/add',[TitleController::class, 'add']);
    Route::post('/division/add',[DivisionController::class, 'add']);
    Route::post('/department/add',[DepartmentController::class, 'add']);
    Route::apiResource('/city/add', CityController::class);
    Route::apiResource('/branch/add', BranchController::class);
    Route::apiResource('/category/add', CategoryController::class);
    Route::delete('/title/{title}',[TitleController::class, 'destroy']);
    Route::delete('/department/{department}',[DepartmentController::class, 'destroy']);
    Route::delete('/division/{division}',[DivisionController::class, 'destroy']);
    Route::delete('/city/{city}',[CityController::class, 'destroy']);
    Route::delete('/branch/{branch}',[BranchController::class, 'destroy']);
    Route::post('/careerlevel',[CareerLevelController::class, 'store']);
    Route::post('/inputs/bulk', [FormInputController::class, 'BulkActions']);
    Route::post('/titles/bulk-move-department', [TitleController::class, 'bulkChangeDepartment']);
    Route::post('/departments/bulk-move-division', [DepartmentController::class, 'bulkChangeDivsion']);
    Route::post('/branches/bulk-move-city', [BranchController::class, 'bulkChangeCity']);
    Route::get('/getDeletedItems', [FormInputController::class, 'getDeleted']);
    Route::get('/getDeletedCourseInputs', [FormInputController::class, 'getCourseFormInputDeleted']);

    Route::apiResource('/divisions', DivisionController::class);
    Route::apiResource('/departments', DepartmentController::class);
    Route::apiResource('/titles', TitleController::class);
    Route::apiResource('/cities', CityController::class);
    Route::apiResource('/branches', BranchController::class);


    //Role API (get and post with /roles, get, put, and delete with /roles/{roleid} every api resource is same as this)
    Route::apiResource('/roles', RoleController::class);
    Route::post('/roles/bulk', [RoleController::class, 'bulkStore']);
    Route::get('/rolepermissions/{role}', [RoleController::class, 'showRolePermissions']);

    //Fetching All Option for dropdown
    Route::get('/options', [OptionController::class,'index']);
    //Fetching All nessesary call for courselist maintenance
    Route::get('/coursecontext',[CourseContextController::class,'index']);
    Route::get('/coursecontext/{id}/{userInfos}',[CourseContextController::class,'getSelectedCourse']);
    Route::get('/courseprogress/{id}/{userInfos}', [CourseContextController::class, 'getProgress']);
    Route::put('/progress/{userInfo}/{type}/{item_id}/{course_id}',[CourseContextController::class, 'handleProgress']);
    Route::get('/coursecontext/{id}',[CourseContextController::class,'adminGetSelectedCourse']);
    Route::get('/getCert/{user}/{course}', [CourseController::class, 'exportCertification']);
    Route::get('/selfenrollcourses/{user}', [CourseController::class, 'selfEnrollCourses']);


    //extra (permission)
    Route::post('/updateRolePermission/{role}', [RoleController::class, 'updateRolePermissions']);
    Route::post('/setCoursePermission/{course}', [CourseController::class, 'setCoursePermissions']);
    Route::put('/updatetest/{userCredentialsId}',[userCredentials_controller::class, 'updateTest']);
    Route::put('/carouselimages/update', [CarouselImageController::class, 'updateSelected']);
    Route::put('/carouselimages/reorder', [CarouselImageController::class, 'reorderCarousel']);

    Route::post('/course/reject-archival/{assign}', [ArchiveCourseController::class, 'rejectArchival']);


    //COURSE CERTIFICATES
    Route::get('/certificates/{user}/{type}', [CertificateController::class, 'getCertificates']);
    Route::post('/certificates/addexternal', [CertificateController::class, 'addExternalCertificate']);
    Route::post('/certificates/destroy/{id}', [CertificateController::class, 'destroyExternalCertificate']);
    Route::get('/search-certificates', [CertificateController::class, 'searchCertificates']);
    Route::get('/getCertificate/{id}' , [CertificateController::class, 'getExternalCertificate']);



    //CompE Routes
    Route::get('/compECourses', [CompECourseController::class, 'index']);
    Route::get('/compECourses/{course}', [CompECourseController::class, 'show']);


    //Notifcation API
    Route::get('/notifications',  function(){
        return "working naman sya tangina";
    });
    Route::get('/has-unread-notifications', [NotificationController::class, 'hasUnreadNotifications']);
    Route::post('/notification/read',[NotificationController::class, 'markAllAsRead']);

    Route::get('/getNotifications', function() {
        $user = Auth::user(); // Replace with the actual user ID

        return $user->notifications()->get();
    });
    Route::delete('/notification/delete/{id}', [NotificationController::class, 'destroy']);


    //Report Generation API
    Route::post('/report/{type}', [ReportGenController::class, 'generate']);
    Route::get('/reports', [ReportGenController::class, 'index']);
    Route::get('/report-columns/{table}', [ReportGenController::class, 'getColumnNames']);
    Route::delete('/hard-delete-user/{user}', [userInfo_controller::class, 'hardDeleteUser']);
    Route::get('getLearnersCompletedStatistic/{course}', [CourseController::class, 'completedLearners']);
    Route::get('getAssessmentStatistic/{course}', [CourseController::class, 'assessmentPerformance']);




    //////
    Route::post('/newAddUser',[userInfo_controller::class, 'newStoreUser']);


    //////////
    ///// COMPELEARN
    /////////

    /// --------------------
    //  Utilities
    /// --------------------
    Route::get('/searchContentHubCourses', [CourseSearchController::class, 'searchContentHubCourses']);
    Route::get('/searchDashboardCourses', [CourseSearchController::class, 'searchDashboardCourses']);
    Route::get('/searchContentBankCourses/creator', [CourseSearchController::class, 'searchContentBankCoursesCreator']);
    Route::get('/searchContentBankCourses/viewer', [CourseSearchController::class, 'searchContentBankCoursesViewer']);
    Route::get('/searchContentBankCourses/distributor', [CourseSearchController::class, 'searchContentBankCoursesDistributor']);

    Route::get('/searchViewerCourses', [CourseSearchController::class, 'searchViewerCourses']);
    Route::get('/searchSMEAvailableViewers', [CourseSearchController::class, 'searchSMEAvailableViewers']);

    Route::get('/notifications', [ZNotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [ZNotificationController::class, 'markRead']);
    Route::post('/notifications/{id}/unread', [ZNotificationController::class, 'markUnread']);

    Route::delete('/deleteNotification/{id}', [ZNotificationController::class, 'deleteNotification']);

    /// --------------------
    //  Courses
    /// --------------------

    Route::get('/toReview', [ZonnectReviewerCourseController::class, 'index']);


    Route::middleware(['course_permission:DeleteCourse'])->group(function () {
        Route::delete('/deleteCourse/{courseId}', [ZConnectDeletedCourse::class, 'deleteCourse']);
    });
    Route::middleware(['course_permission:ArchiveCourse'])->group(function () {
        Route::delete('/archiveCourse/{courseId}', [ZConnectDeletedCourse::class, 'archiveCourse']);
    });

    Route::post('/deleteArchivedCourse/{courseId}', [ZConnectDeletedCourse::class, 'deleteArchivedCourse']);
    Route::post('/hardDeleteCourse/{courseId}', [ZConnectDeletedCourse::class, 'hardDeleteCourse']);
    Route::post('/restoreCourse/{courseId}', [ZConnectDeletedCourse::class, 'restoreCourse']);
    Route::post('/restoreInactiveCourse/{courseId}', [ZConnectDeletedCourse::class, 'restoreInactiveCourse']);

    Route::get('/fetchDeletedCourseSettings', [ZConnectDeletedCourse::class, 'fetchDeletedCourseSettings']);
    Route::put('/updateDeletedCourseSettings', [ZConnectDeletedCourse::class, 'updateDeletedCourseSettings']);


    Route::middleware(['course_permission:ExportCourse'])->group(function () {
        Route::get('/course/{courseId}/softcopy', [ZCourseController::class, 'showSoftCopy'])->name('course.softcopy');
    });

    /// --------------------
    //  Course Creation
    /// --------------------
    Route::apiResource('/createCourse', ZconnectCreatedCourseController::class);
    Route::get('/sharedCourses', [ZconnectCreatedCourseController::class, 'sharedCourses']);

    Route::get('/getCourse/{status}', [ZconnectCreatedCourseController::class, 'getCourseByStatus']);

    Route::get('getCreatingCourse/{id}', [ZconnectCreatedCourseController::class, 'course']);

    Route::middleware(['course_permission:EditCourseDetails'])->group(function () {
        Route::post('/uploadImageBanner/{courseId}', [CourseCreationController::class, 'uploadImageBanner']);
    });

    Route::middleware(['course_permission:EditCourseDetails'])->group(function () {
        Route::put('/updateCourseInformation/{courseId}', [CourseCreationController::class, 'updateCourseInformation']);
        Route::put('/updateCourseDetails/{courseId}', [CourseCreationController::class, 'updateCourseDetails']);
    });

    Route::get('/getViewers', [userInfo_controller::class, 'getSMEViewer']);
    Route::get('/getCreators/{courseId}', [userInfo_controller::class, 'getSMECreator']);

    Route::middleware(['course_permission:CompleteCourse'])->group(function () {
        Route::post('/assignViewers/{courseId}', [ZonnectReviewerCourseController::class, 'bulkAssign']);
        Route::post('/revokeApproval/{courseId}', [ZonnectReviewerCourseController::class, 'bulkRevokeApproval']);
    });

    /// --------------------
    //  Module Items
    /// --------------------
    Route::get('/fetchModuleItems/{courseId}', [CourseCreationController::class, 'fetchModuleItems']);

    Route::middleware(['course_permission:CreateItems'])->group(function () {
        Route::post('/postModuleItem/{courseId}', [CourseCreationController::class, 'postModuleItem']);
    });

    Route::get('fetchAttachment/{AttachmentId}', [ZCourseAttachmentController::class, 'fetchAttachment']);
    Route::get('/uploadedFile/{id}', [ZCourseAttachmentController::class, 'uploadedFile']);

    Route::put('updateVideoAttachment/{AttachmentId}', [ZCourseAttachmentController::class, 'updateVideoAttachment']);
    Route::put('updateFileAttachment/{AttachmentId}', [ZCourseAttachmentController::class, 'updateFileAttachment']);
    Route::delete('/deleteFileAttachment/{attachmentId}', [ZCourseAttachmentController::class, 'deleteFileAttachment']);

    Route::post('/uploadVideoFile/{AttachmentId}', [ZCourseAttachmentController::class, 'uploadVideoFile']);
    Route::post('/uploadDocumentFile/{AttachmentId}', [ZCourseAttachmentController::class, 'uploadDocumentFile']);
    Route::delete('/deleteVideoAttachment/{attachmentId}', [ZCourseAttachmentController::class, 'deleteVideoAttachment']);


    Route::middleware(['course_permission:DeleteItems'])->group(function () {
        Route::post('/deleteItem/{courseId}', [CourseCreationController::class, 'deleteItem']);
    });

    Route::get('/fetchTrashedItems/{courseId}', [CourseCreationController::class, 'fetchTrashedItems']);
    Route::post('/restoreTrashedItem', [CourseCreationController::class, 'restoreTrashedItem']);

    /// --------------------
    //  Lessons
    /// --------------------
    Route::get('/fetchCourseOfLesson/{lessonId}', [ZLessonController::class, 'fetchCourseOfLesson']);
    Route::get('/fetchLessonContent/{lessonId}', [ZLessonController::class, 'fetchLessonContent']);

    Route::middleware(['course_permission:EditItems'])->group(function () {
        Route::put('/updateLessonContent/{lessonId}/{courseId}', [ZLessonController::class, 'updateLessonContent']);
        Route::put('/updateLessonDetails/{lessonId}/{courseId}', [ZLessonController::class, 'updateLessonDetails']);
    });

    Route::post('/uploadLessonImage', [ZLessonController::class, 'uploadLessonImage']);
    Route::post('/deleteLessonImage', [ZLessonController::class, 'deleteLessonImage']);

    /// --------------------
    //  Assessment
    /// --------------------
    Route::get('/fetchCourseOfAssessment/{assessmentId}', [ZTestController::class, 'fetchCourseOfAssessment']);
    Route::get('/fetchAssessmentContent/{assessmentId}', [ZTestController::class, 'fetchAssessmentContent']);
    Route::get('/assessment/{id}', [ZTestController::class, 'fetchAssessment']);

    Route::middleware(['course_permission:EditItems'])->group(function () {
        Route::post('/handleAssessment/{id}/{courseId}', [ZTestController::class, 'handleAssessmentItem']); // bat may ganito?
        Route::put('/updateAssessmentDetails/{assessmentId}/{courseId}', [ZTestController::class, 'updateAssessmentDetails']);
        Route::put('/updateQuestionBlocks/{assessmentId}/{courseId}', [ZTestController::class, 'updateQuestionBlocks']);
    });

    /// --------------------
    //  Certificates
    /// --------------------
    Route::middleware(['course_permission:AddSignatures'])->group(function () {
        Route::post('/uploadCertificateCreditors/{certificateId}/{courseId}', [ZCourseCertificateController::class, 'uploadCertificateCreditors']);
        Route::put('/updateCertificateCreditors/{creditorId}/{courseId}', [ZCourseCertificateController::class, 'updateCertificateCreditors']);
    });

    Route::get('/fetchCertificateSignatures/{certificateId}', [ZCourseCertificateController::class, 'fetchCertificateSignatures']);
    Route::delete('/deleteCertificateSignature/{creditorId}', [ZCourseCertificateController::class, 'deleteCertificateSignature']);

    /// --------------------
    //  Permissions
    /// --------------------
    Route::middleware(['course_permission:PermissionControl'])->group(function () {
        Route::post('/inviteSMECreatorCollaboration/{courseId}', [ZCoursePermissionController::class, 'inviteSMECreatorCollaboration']);
        Route::put('/assignCoursePermissions/{courseId}', [ZCoursePermissionController::class, 'assignCoursePermissions']);
    });

    Route::post('/revokeCourseInvitation/{courseId}', [ZCoursePermissionController::class, 'revokeCourseInvitation']);

    Route::get('/fetchInvitedSMECreator/{courseId}', [ZCoursePermissionController::class, 'fetchInvitedSMECreator']);
    Route::get('/fetchSMEPermissions/{courseId}', [ZCoursePermissionController::class, 'fetchSMEPermissions']);

    Route::get('/course/{courseId}/my-permissions', [ZCoursePermissionController::class, 'fetchMyPermissions']);

    /// --------------------
    //  Course Version History
    /// --------------------
    Route::get('/fetchCourseVersionHistory/{courseId}', [ZConnectCourseVersionHistory::class, 'fetchCourseVersionHistory']);

    /// --------------------
    // Get Division with department
    /// --------------------
    Route::get('/getDivisionsByDepartment/{id}', [DepartmentController::class, 'getDivisionbyDepartment']);
    Route::get('/getDivision/{id}', [DivisionController::class, 'findDivisionbyId']);

    /// --------------------
    //  Dashboard APIs
    /// --------------------

    // ----- Creator Dashboard ----- //
    Route::get('/recentOpenedCourses', [RecentCourseController::class, 'getRecentOpenedCourses']);

    Route::get('/getCategories/{courseStatus}', [ZDashboardController::class,'fetchCategoriesOfCreatedCourses']);
    Route::get('/getSharedCategories/{courseStatus}', [ZDashboardController::class, 'fetchCategoriesOfSharedCourses']);

    Route::get('/courseStats', [ZDashboardController::class, 'getCounts']);
    Route::get('/fetchAllContent', [ZDashboardController::class, 'fetchAllContent']);

    // ----- Viewer Dashboard ----- //
    Route::get('/getCourseReviewStatus', [ZDashboardController::class, 'getCourseReviewStatus']);

    // ----- Distributor Dashboard ----- //
    Route::get('/getCourseDistributionStatus', [ZDashboardController::class, 'getCourseDistributionStatus']);
    Route::get('/fetchCategoriesOfCourses', [ZDashboardController::class, 'fetchCategoriesOfCourses']);
    Route::get('/fetchAllDistributedCourses', [ZDashboardController::class, 'fetchAllDistributedCourses']);

    /// --------------------
    //  SetCourseStatus
    /// --------------------
    Route::put('/setCourseDraft/{courseId}', [ZconnectCreatedCourseController::class, 'setCourseDraft']);
    Route::get('/getDraftedCourses', [ZconnectCreatedCourseController::class, 'getDraftedCourses']);
    Route::put('/setCourseReviewed/{courseId}', [ZconnectCreatedCourseController::class, 'setReviewed']);
    Route::get('/getReviewedCourses', [ZconnectCreatedCourseController::class, 'getReviewedCourses']);
    Route::put('/setCoursePublished/{courseId}', [ZconnectCreatedCourseController::class, 'setCoursePublished']);
    Route::get('/getPublishedCourses/{categoryId}', [ZconnectCreatedCourseController::class, 'getPublishedCourses']);

    Route::post('/submitForReApproval/{courseId}', [ZconnectCreatedCourseController::class, 'submitForReApproval']);

    /// --------------------
    /// Approval
    /// --------------------
    Route::post('/approveResponse/{id}', [ZonnectReviewerCourseController::class, 'approveResponse']);
    Route::get('/responses/{id}', [ZonnectReviewerCourseController::class, 'reponses']);

    Route::get('/getPreviousApprovers/{courseId}', [ZonnectReviewerCourseController::class, 'getPreviousApprovers']);

    Route::post('/reassignViewers/{courseId}', [ZonnectReviewerCourseController::class, 'reassignViewers']);
    Route::get('/getCourseReApprovalReasonData/{courseId}', [ZonnectReviewerCourseController::class, 'getCourseReApprovalReasonData']);

    Route::get('/fetchOtherApprovers/{courseId}', [ZonnectReviewerCourseController::class, 'fetchOtherApprovers']);

    /// --------------------
    // Distribution
    /// --------------------
    Route::post('/assign-course-admin/{course}', [CourseController::class, 'assignCourseAdmin']);
    Route::post('/fetchAssignedCourseAdmins/{course}', [CourseController::class, 'fetchAssignedCourseAdmins']);
    Route::get('/get-available-course-admins/{course}', [userInfo_controller::class, 'indexAvailableCourseAdmins']);
    Route::get('/get-assigned-course-admins/{course}', [userInfo_controller::class, 'indexAssignedCourseAdmins']);

    Route::get('/fetchAssignedCourseAdmins/{course}', [ZConnectDistributorController::class, 'fetchAssignedCourseAdmins']);
    Route::post('/archiveCourseWithCourseAdmins/{CourseID}', [ZConnectDistributorController::class, 'archiveCourseWithCourseAdmins']);


    //Need Get assigned


    /// --------------------
    //  Helper
    /// --------------------
    Route::post('/logOpenCourse/{courseId}', [RecentCourseController::class, 'logsOpenedCourse']);
    Route::get('/getCourseDevelopment/{courseId}', [ZconnectCreatedCourseController::class, 'getCourseDevelopment']);

    /// --------------------
    //  Utilities
    /// --------------------
    Route::get('/fetchUserReports/{userInfoId}', [ZUserReportsController::class, 'fetchUserReports']);
    Route::get('/downloadUserReport/{userInfoId}', [ZUserReportsController::class, 'downloadUserReport']);

});
Route::get('/status/{userId}/{lessonId}/{course_id}', [LessonsController::class, 'updateLearnerProgress']);
Route::post('/permissions/bulk', [PermissionController::class, 'bulkAdd']);
Route::get('/test-broadcast', function () {
    broadcast(new NotificationsMarkedAsRead(1));
    return 'done';
});

Route::get('/test_report/{course_id}',[ReportGenController::class, 'test']);


Route::get('/optionAuthoring', [OptionController::class, 'indexAuthoringOptions']);



Route::delete('/category/{category}',[CategoryController::class, 'destroy']);






//Options
Route::get('/getHierchy', [OptionController::class, 'indexDepartmentDivisionTitles']);
Route::get('/getLesson/{lessonId}', [ZLessonController::class, 'getLesson']);


//Certificate Testing
Route::get('/certificate', [ZconnectCreatedCourseController::class, 'show']);
Route::get('/certificateCreditorCredentials/{certificateId}', [ZCourseCertificateController::class, 'certificateCreditorCredentials']);

//testing
Route::get('/get/{id}', [ZTestController::class, 'fetchAssessment']);






//PUSH NOTIFICATION
// Route::post('/send-reset-password-req', [PushNotificationController::class, 'sendResetPasswordReq']);
//Design View PUSH NOTIFICATION
// Route::get('/preview-reset-password-email', function () {
//     $data = [
//         'username' => 'Test User',
//         'imageUrl' => asset('storage/images/Panel-1.png'),
//         'message' => 'Click the link below to reset your password:',
//         'actionUrl' => 'https://example.com/reset-password?email=test@example.com',
//         'actionText' => 'Reset Password',
//     ];
//     return view('emails.reset_password_notification', $data);
// });

Route::post('/send-notfication', function (){
    $user = UserCredentials::find(1); // Replace with the actual user ID
    $user->notify(new TestNotification());

    if($user){
        $message = 'Notification sent successfully';
    } else {
        $message = 'Failed to send notification';
    }

    return response()->json(['message' => $message], 200);
});


Route::apiResource('/carousels', CarouselImageController::class);





//Category API
Route::get('category',[FilterCategoryController::class, 'index']);
Route::post('create-category',[FilterCategoryController::class, 'store']);
route::post('create-option', [FilterOptionController::class, 'store']);
route::get('/index-logs', [ActivityLogsController::class, 'index']);



Route::get('/test/{id}', function ($id) {
    $course = ZCompELearnCreatedCourse::withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
            ->with(['division', 'careerLevel', 'category', 'userInfo', 'userInfo.userCredentials'])
            ->find($id);

    if (empty($course)) {
        return response()->json(['message' => 'Course not found'], 404);
    }

    return response()->json($course, 200);
});

// Route::get('/reset-user',[userInfo_controller::class, 'resetUser']); //reset user table
// Route::get('/reset-user-creds',[userCredentials_controller::class, 'resetUsers']); //reset user table





//Microsoft Graph API - Gmail Service
Route::get('/auth/redirect', function () {
    $query = http_build_query([
        'client_id' => env('MS_GRAPH_CLIENT_ID'),
        'response_type' => 'code',
        'redirect_uri' => env('MS_GRAPH_REDIRECT_URI'),
        'response_mode' => 'query',
        'scope' => env('MS_GRAPH_SCOPE'),
    ]);

    return redirect("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?$query");
});
Route::get('/auth/callback', function (Request $request) {
    $response = Http::asForm()->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
        'client_id' => env('MS_GRAPH_CLIENT_ID'),
        'client_secret' => env('MS_GRAPH_CLIENT_SECRET'),
        'grant_type' => 'authorization_code',
        'code' => $request->code,
        'redirect_uri' => env('MS_GRAPH_REDIRECT_URI'),
        'scope' => env('MS_GRAPH_SCOPE'),
    ]);

    if (!$response->successful()) {
        return response()->json([
            'error' => 'Failed to get token',
            'details' => $response->body(),
        ], 500);
    }

    $token = $response->json();

    file_put_contents(storage_path('app/msgraph/token.json'), json_encode($token, JSON_PRETTY_PRINT));

    return "✅ Token saved successfully!";
});

Route::get('/test1',[userInfo_controller::class, 'test']);
Route::get('/sendNotification',[userInfo_controller::class, 'notificate']);



Route::get('/carousels/{type}', [CarouselImageController:: class, 'getPanels']);
Route::get('mail/preview', function () {
    $data = [
        'heading' => 'Course Enrollment',
        'subheading' => 'Course name Enrollment',
        'shortdesc' => 'You have been enrolled in the course Course name.',
        'fulldesc' => 'Please click the button below to access the course and start learning.',
        'followup' => 'If you have any questions or need assistance, feel free to reach out to our support team.',
        'link' => 'https://example.com/courses/1',

    ];
    return view('emails.notificationTemplate', $data);
});

Route::get('getEnrollees/{course}', [userInfo_controller::class, 'indexEnrollingUsers']);


Route::patch('/soft-delete/{id}', [FormInputController::class, 'softDelete']);
Route::patch('/restore-item/{id}', [FormInputController::class, 'Restore']);


