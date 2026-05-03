<?php

namespace App\Http\Controllers\CompELearnController\Permission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\CompELearnEvent\ViewerAssign;
use App\Notifications\ZConnectInviteCollaborationNotification;
use App\Models\ZCompELearnUserReports;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\UserInfos;
use App\Models\ZCompELearn\Permissions\CoursePermissions;
use App\Models\ZCompELearn\Permissions\PermittedSME;
use App\Models\ZCompELearnNotificationMessage;

class ZCoursePermissionController extends Controller
{
    public function inviteSMECreatorCollaboration(Request $request)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'PermittedID' => ['required', 'exists:userInfo,id'],
            'course_id' => ['required', 'exists:zconnect_created_courses,id'],
        ]);

        $permissionIds = DB::table('zconnect_sme_permissions')->pluck('id')->toArray();

        if (empty($permissionIds)) {
            return response()->json(['message' => 'No permissions found to assign'], 500);
        }


        // fetch all permissions then insert
        $exists = PermittedSME::where('PermittedID', $validated['PermittedID'])
            ->where('course_id', $validated['course_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This collaboration already exists.',
            ], 409);
        }

        $permissionIds = DB::table('zconnect_sme_permissions')->pluck('id');

        $records = [];
        foreach ($permissionIds as $permissionId) {
            $records[] = [
                'PermittedID' => $validated['PermittedID'],
                'PermissionsID' => $permissionId,
                'course_id' => $validated['course_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        PermittedSME::insert($records);
        // fetch all permissions then insert

        $assignedCount = PermittedSME::where('PermittedID', $validated['PermittedID'])
            ->where('course_id', $validated['course_id'])
            ->count();

        $totalPermissions = count($permissionIds);

        if ($assignedCount === $totalPermissions) {
            \Log::info("User ID {$validated['PermittedID']} assigned full permissions ({$totalPermissions}) on course ID {$validated['course_id']}.");
        } else {
            \Log::warning("User ID {$validated['PermittedID']} assigned only {$assignedCount} out of {$totalPermissions} permissions on course ID {$validated['course_id']}.");
        }

        $record = PermittedSME::create([
            'PermittedID' => $validated['PermittedID'],
            'PermissionsID' => null,
            'course_id' => $validated['course_id'],
        ]);

        $course = ZCompELearnCreatedCourse::find($validated['course_id']);
        $permittedUser = UserInfos::find($validated['PermittedID']);
        $permittedUserName = trim(($permittedUser->first_name ?? '') . ' ' . ($permittedUser->middle_name ?? '') . ' ' . ($permittedUser->last_name ?? ''));

        $inviterInfo = $user->userInfos;
        $inviterName = trim("{$inviterInfo->first_name} {$inviterInfo->middle_name} {$inviterInfo->last_name}");
        if ($inviterInfo->name_suffix) {
            $inviterName .= ' ' . $inviterInfo->name_suffix;
        }
        $courseName = $course->CourseName;

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Invited SME Creator Collaboration',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Permitted User Name' => $permittedUserName,
            ],
            'timestamp' => now(),
        ]);

        $notificationData = [
            'CourseName' => $courseName,
            'user_info_id' => $permittedUser->id,
            'user_credentials_id' => $permittedUser->user_credentials_id,
            'course_id' => $course->id,
            'assignerName' => $inviterName,
            'message' => "You have been invited to collaborate on Course: {$courseName}",
            'created_at' => now()->setTimezone('Asia/Manila')->toDateTimeString(),
        ];

        ZCompELearnNotificationMessage::create([
            'user_info_id' => $notificationData['user_info_id'],
            'course_id' => $notificationData['course_id'],
            'CourseName' => $notificationData['CourseName'],
            'AssignerName' => $notificationData['assignerName'],
            'Message' => $notificationData['message'],
            'ReadAt' => null,
        ]);

        $courseId = $course->id;
        $courseUrl = "https://mb-authoringtool.online/SubjectMatterExpert/coursecreation/{$courseId}?tab=details";

        $recipientName = trim("{$permittedUser->first_name} {$permittedUser->middle_name} {$permittedUser->last_name}");
        if ($permittedUser->name_suffix) {
            $recipientName .= ' ' . $permittedUser->name_suffix;
        }
        
        event(new ViewerAssign($notificationData));
        $permittedUser->userCredentials?->notify(new ZConnectInviteCollaborationNotification($courseName, $inviterName, $recipientName, $courseUrl));

        return response()->json([
            'message' => 'SME Creator collaboration invited successfully',
            'data' => $record,
        ], 201);
    }

    public function fetchInvitedSMECreator(Request $request, $courseId)
    {
        $permittedId = $request->query('PermittedID');

        $query = PermittedSME::with('user');

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($permittedId) {
            $query->where('PermittedID', $permittedId);
        }

        $records = $query->get()->unique('PermittedID')->values();

        return response()->json([
            'message' => 'Fetched SME collaborations successfully',
            'data' => $records,
        ]);
    }

    public function assignCoursePermissions(Request $request, $courseId)
    {
        $authUser = auth()->user();
        $authUserInfoId = $authUser->userInfos->id;

        $request->validate([
            'userId' => 'required|integer|exists:userInfo,id',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:zconnect_sme_permissions,name',
        ]);

        $userId = $request->input('userId');
        $permissions = $request->input('permissions');

        $permissionRecords = CoursePermissions::whereIn('name', $permissions)->pluck('id', 'name');

        DB::beginTransaction();

        try {
            DB::table('zconnect_sme_permitted')
                ->where('PermittedID', $userId)
                ->where('course_id', $courseId)
                ->delete();

            $insertData = [];
            $now = now();
            foreach ($permissions as $perm) {
                $insertData[] = [
                    'PermittedID' => $userId,
                    'PermissionsID' => $permissionRecords[$perm],
                    'course_id' => $courseId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('zconnect_sme_permitted')->insert($insertData);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to assign permissions.'], 500);
        }

        $course = DB::table('zconnect_created_courses')->where('id', $courseId)->first();

        $permittedUser = UserInfos::find($userId);

        $permittedUserName = trim(($permittedUser->first_name ?? '') . ' ' . ($permittedUser->middle_name ?? '') . ' ' . ($permittedUser->last_name ?? ''));

        ZCompELearnUserReports::create([
            'user_info_id' => $authUserInfoId,
            'Action' => 'Assigned Course Permissions',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Permitted User Name' => $permittedUserName,
                'Permissions' => implode(', ', $permissions),
            ],
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'Permissions assigned successfully.']);
    }



    public function revokeCourseInvitation(Request $request, $courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'userId' => 'required|exists:userInfo,id',
        ]);

        $userId = $request->input('userId');

        DB::table('zconnect_sme_permitted')
            ->where('PermittedID', $userId)
            ->where('course_id', $courseId)
            ->delete();

        $course = DB::table('zconnect_created_courses')->where('id', $courseId)->first();
        $courseName = $course ? $course->CourseName : null;

        $permittedUser = DB::table('userInfo')->where('id', $userId)->first();
        $permittedUserName = trim(($permittedUser->first_name ?? '') . ' ' . ($permittedUser->middle_name ?? '') . ' ' . ($permittedUser->last_name ?? ''));


        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Revoked Course Invitation',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $courseName,
                'Permitted User Name' => $permittedUserName,
            ],
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Course invitation revoked successfully',
        ]);
    }




    public function fetchSMEPermissions(Request $request, $courseId)
    {

        $request->validate([
            'userId' => 'required|integer|exists:userInfo,id',
        ]);

        $userId = $request->query('userId');

        $permissions = DB::table('zconnect_sme_permitted')
            ->join('zconnect_sme_permissions', 'zconnect_sme_permitted.PermissionsID', '=', 'zconnect_sme_permissions.id')
            ->where('zconnect_sme_permitted.PermittedID', $userId)
            ->where('zconnect_sme_permitted.course_id', $courseId)
            ->pluck('zconnect_sme_permissions.name')
            ->toArray();

        return response()->json([
            'permissions' => $permissions,
        ]);
    }

    public function fetchMyPermissions(Request $request, $courseId)
    {
        $userInfoId = $request->query('userInfoId');

        $permissions = DB::table('zconnect_sme_permitted')
            ->join('zconnect_sme_permissions', 'zconnect_sme_permitted.PermissionsID', '=', 'zconnect_sme_permissions.id')
            ->where('zconnect_sme_permitted.PermittedID', $userInfoId)
            ->where('zconnect_sme_permitted.course_id', $courseId)
            ->pluck('zconnect_sme_permissions.name')
            ->toArray();

        return response()->json([
            'permissions' => $permissions,
        ]);
    }

    public function fetchCollabPermission(Request $request, $courseId, $permission)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userInfoId = $user->userInfos->id ?? null;

        if (!$userInfoId) {
            return response()->json(['message' => 'User info not found'], 400);
        }

        $isOwner = DB::table('zconnect_created_courses')
            ->where('id', $courseId)
            ->where('user_info_id', $userInfoId)
            ->exists();

        if ($isOwner) {
            return response()->json([
                'hasPermission' => true,
                'isOwner' => true,
                'message' => 'User is the course owner.'
            ]);
        }

        $hasPermission = DB::table('zconnect_sme_permitted')
            ->join('zconnect_sme_permissions', 'zconnect_sme_permitted.PermissionsID', '=', 'zconnect_sme_permissions.id')
            ->where('zconnect_sme_permitted.PermittedID', $userInfoId)
            ->where('zconnect_sme_permitted.course_id', $courseId)
            ->where('zconnect_sme_permissions.name', $permission)
            ->exists();

        if ($hasPermission) {
            return response()->json([
                'hasPermission' => true,
                'isOwner' => false,
                'message' => 'User has the required permission.'
            ]);
        }

        return response()->json([
            'hasPermission' => false,
            'isOwner' => false,
            'message' => 'User does not have the required permission.'
        ], 403);
    }

}
