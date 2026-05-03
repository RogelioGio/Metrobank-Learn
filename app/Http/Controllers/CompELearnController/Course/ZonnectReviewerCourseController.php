<?php

namespace App\Http\Controllers\CompELearnController\Course;
use App\Events\ReviewerResponded;
use App\Events\CompELearnEvent\ViewerAssign;
use App\Events\CompELearnEvent\ZCourseAssignmentUpdated;
use App\Http\Controllers\Controller;
use App\Notifications\ZConnectCourseAssignedNotification;
use App\Notifications\ZConnectApproveCourseNotification;
use App\Notifications\ZConnectSubmissionForReApproval;
use App\Notifications\ZConnectCourseRevokedNotification;
use App\Models\ZCompELearnNotificationMessage;
use App\Models\UserInfos;
use App\Models\ZCompELearnCourseViewer;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnUserReports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Auth;
use Log;

class ZonnectReviewerCourseController extends Controller
{
    public function bulkAssign(Request $request)
    {
        $user = Auth::user()->load('userInfos');
        $userInfos = $user->userInfos;

        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $assignerName = trim("{$userInfos->first_name} {$userInfos->middle_name} {$userInfos->last_name}");
        if ($userInfos->name_suffix) {
            $assignerName .= ' ' . $userInfos->name_suffix;
        }

        $request->validate([
            '*.course_id' => 'required|exists:zconnect_created_courses,id',
            '*.user_info_id' => 'required|exists:userInfo,id',
        ]);

        $courseId = $request[0]['course_id'] ?? null;
        $course = ZCompELearnCreatedCourse::find($courseId);
        $courseName = $course->CourseName;


        $assigned = [];

        foreach ($request->all() as $viewer) {
            $userInfo = UserInfos::find($viewer['user_info_id']);
            
            if (!$userInfo || !$userInfo->user_credentials_id) {
                continue;
            }

            $assignment = ZCompELearnCourseViewer::updateOrCreate(
                [
                    'course_id' => $viewer['course_id'],
                    'user_info_id' => $viewer['user_info_id'],
                ],
                [
                    'user_credentials_id' => $userInfo->user_credentials_id,
                    'approval_status' => 'pending',
                    'feedback' => null,
                ]
            );

            $assigned[] = $assignment;

            $notificationData = [
                'CourseName' => $courseName,
                'user_info_id' => $assignment->user_info_id,
                'user_credentials_id' => $assignment->user_credentials_id,
                'course_id' => $assignment->course_id,
                'assignerName' => $assignerName,
                'message' => "You have been assigned to Course: {$courseName}",
                'created_at' => now()->setTimezone('Asia/Manila')->toDateTimeString(),
            ];

            $courseUrl = "https://mb-authoringtool.online/SubjectMatterExpert/coursecreation/{$courseId}?tab=details";

            $recipientName = trim("{$userInfo->first_name} {$userInfo->middle_name} {$userInfo->last_name}");
            if ($userInfo->name_suffix) {
                $recipientName .= ' ' . $userInfo->name_suffix;
            }

            event(new ViewerAssign($notificationData));
            $userInfo->userCredentials?->notify(new ZConnectCourseAssignedNotification($courseName, $assignerName, $courseUrl, $recipientName));
            event(new ZCourseAssignmentUpdated($assignment->user_info_id));
        }
        
        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Course Submitted for Approval',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Assigned By' => $assignerName,
                'Assignment Status' => 'Pending Approval',
            ],
            'timestamp' => now(),
        ]);

        ZCompELearnNotificationMessage::create([
            'user_info_id' => $notificationData['user_info_id'],
            'course_id' => $notificationData['course_id'],
            'CourseName' => $notificationData['CourseName'],
            'AssignerName' => $notificationData['assignerName'],
            'Message' => $notificationData['message'],
            'ReadAt' => null,
        ]);

        if (!empty($request[0]['course_id'])) {
            \DB::table('zconnect_created_courses')
                ->where('id', $request[0]['course_id'])
                ->update(['CourseStatus' => 'draft']);
        }

        return response()->json([
            'message' => 'Viewers assigned successfully',
            'data' => $assigned,
        ], 200);
    }


    public function bulkRevokeApproval(Request $request, $courseId)
    {
        $course = ZCompELearnCreatedCourse::find($courseId);
        $beReviews = ZCompELearnCourseViewer::where('course_id', $courseId)->get();

        \DB::beginTransaction();

        try {
            $assigner = Auth::user()->load('userInfos')->userInfos;
            $assignerName = trim("{$assigner->first_name} {$assigner->middle_name} {$assigner->last_name}");
            if ($assigner->name_suffix) {
                $assignerName .= ' ' . $assigner->name_suffix;
            }

            $revokedUsers = [];

            foreach ($beReviews as $beReview) {
                $userInfo = UserInfos::find($beReview->user_info_id);
                if (!$userInfo) {
                    continue;
                }

                $recipientName = trim("{$userInfo->first_name} {$userInfo->middle_name} {$userInfo->last_name}");
                if ($userInfo->name_suffix) {
                    $recipientName .= ' ' . $userInfo->name_suffix;
                }

                $userInfo->userCredentials?->notify(new ZConnectCourseRevokedNotification($course->CourseName, $assignerName, $recipientName));

                event(new ZCourseAssignmentUpdated($userInfo->id));

                ZCompELearnNotificationMessage::create([
                    'user_info_id' => $userInfo->id,
                    'course_id' => $courseId,
                    'CourseName' => $course->CourseName,
                    'AssignerName' => $assignerName,
                    'Message' => "Your approval for Course '{$course->CourseName}' has been revoked.",
                    'ReadAt' => null,
                ]);

                $revokedUsers[] = $userInfo->id;
            }

            ZCompELearnCourseViewer::where('course_id', $courseId)->delete();

            $course->CourseStatus = 'created';
            $course->save();

            ZCompELearnUserReports::create([
                'user_info_id' => $assigner->id,
                'Action' => 'Course Approval Revoked',
                'Details' => [
                    'Revoked By' => $assignerName,
                    'Revoked Users Count' => count($revokedUsers),
                    'Course ID' => $courseId,
                    'Course Name' => $course->CourseName,
                ],
                'timestamp' => now(),
            ]);

            \DB::commit();

            return response()->json([
                'message' => 'Course approvals revoked successfully',
                'revoked_users' => $revokedUsers,
            ], 200);

        } catch (\Exception $e) {
            \DB::rollBack();

            \Log::error('Error revoking approval: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to revoke course approvals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }




    public function index() {
        $user = Auth::user()->load('userInfos');

        $tobeReviewed = ZCompELearnCourseViewer::
                        where('user_info_id', $user->userInfos->id)
                        ->where('approval_status', "pending")
                        ->with('course')
                        ->get();

        $flattened = $tobeReviewed->map(function ($item) {
            $courseData = $item->course ? $item->course->toArray() : [];

            $parentData = $item->toArray();
            unset($parentData['course']);

            return array_merge($parentData, $courseData);
        });

        return response()->json($flattened);
    }


    public function approveResponse(Request $request, $id)
    {
        $user = Auth::user()->load('userInfos');
        $userInfo = $user->userInfos;

        $request->validate([
            'response' => 'required|in:approved,rejected',
            'feedback' => 'nullable|string',
        ]);

        $approvalResponse = ZCompELearnCourseViewer::where('user_info_id', $userInfo->id)
            ->where('course_id', $id)
            ->first();

        if (!$approvalResponse) {
            return response()->json([
                'message' => 'Approval record not found.',
            ], 404);
        }

        $approvalResponse->approval_status = $request->response;
        $approvalResponse->feedback = $request->feedback;
        $approvalResponse->save();

        $course = ZCompELearnCreatedCourse::find($id);
        if (!$course) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        $creator = UserInfos::find($course->user_info_id);

        if (!$creator) {
            return response()->json([
                'message' => 'Course creator not found.',
            ], 404);
        }

        $reviewerName = trim("{$userInfo->first_name} {$userInfo->middle_name} {$userInfo->last_name}");
        if ($userInfo->name_suffix) {
            $reviewerName .= ' ' . $userInfo->name_suffix;
        }

        $creatorName = trim("{$creator->first_name} {$creator->middle_name} {$creator->last_name}");
        if ($creator->name_suffix) {
            $creatorName .= ' ' . $creator->name_suffix;
        }

        $notificationData = [
            'CourseName' => $course->CourseName,
            'user_info_id' => $creator->id,
            'user_credentials_id' => $creator->user_credentials_id,
            'course_id' => $course->id,
            'message' => "{$reviewerName} has {$request->response} the course \"{$course->CourseName}\".",
            'assignerName' => $creatorName,
            'created_at' => now()->setTimezone('Asia/Manila')->toDateTimeString(),
        ];
 \Log::info("check this cuz: " . json_encode($notificationData));

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfo->id,
            'Action' => 'Course ' . ucfirst($request->response),
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Reviewer' => $reviewerName,
                'Approval Status' => $request->response,
                'Feedback' => $request->feedback ?? '',
            ],
            'timestamp' => now(),
        ]);
        
        ZCompELearnNotificationMessage::create([
            'user_info_id' => $notificationData['user_info_id'],
            'course_id' => $notificationData['course_id'],
            'CourseName' => $notificationData['CourseName'],
            'AssignerName' => $notificationData['assignerName'],
            'Message' => $notificationData['message'],
            'ReadAt' => null,
        ]);

        $courseId = $course->id;
        $courseUrl = "https://mb-authoringtool.online/SubjectMatterExpert/coursecreation/{$courseId}";

        $recipientName = trim("{$creator->first_name} {$creator->middle_name} {$creator->last_name}");
        if ($creator->name_suffix) {
            $recipientName .= ' ' . $creator->name_suffix;
        }

        event(new ViewerAssign($notificationData));
        $creator->userCredentials?->notify(new ZConnectApproveCourseNotification($course->CourseName, $reviewerName, $request->response, $recipientName, $courseUrl));

        ReviewerResponded::dispatch($course, $userInfo);

        return response()->json([
            'message' => 'Response recorded successfully',
        ]);
    }



    public function reponses($id){
        $responses = ZCompELearnCourseViewer::where('course_id', $id)
                        ->with(['userInfo', 'userInfo.userCredentials'])
                        ->get();
        return response()->json($responses);
    }


    public function getPreviousApprovers($courseId)
    {
        $course = ZCompELearnCreatedCourse::with('approvers')->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $approvers = $course->approvers->map(function ($approver) {
            return [
                'id' => $approver->id,
                'first_name' => $approver->first_name ?? '',
                'middle_name' => $approver->middle_name ?? '',
                'last_name' => $approver->last_name ?? '',
                'employeeID' => $approver->employeeID ?? '',
                'user_credentials' => [
                    'MBemail' => $approver->MBemail ?? '',
                ],
                'profile_image' => $approver->profile_image ?? '',
                'response' => $approver->pivot->approval_status,
                'comment' => $approver->pivot->feedback,
                'timestamp' => $approver->pivot->created_at->toDateTimeString(),
            ];
        });

        return response()->json($approvers);
    }
    public function reassignViewers(Request $request, $courseId)
    {
        $user = auth()->user();
        $userInfo = $user->userInfos;
        $assignerName = trim("{$userInfo->first_name} {$userInfo->middle_name} {$userInfo->last_name}");
        if ($userInfo->name_suffix) {
            $assignerName .= ' ' . $userInfo->name_suffix;
        }

        $course = ZCompELearnCreatedCourse::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $courseName = $course->CourseName ?? 'Untitled Course';
        $courseUrl = url("/course/{$courseId}");
        $reason = $request->input('reason');

        try {
            DB::beginTransaction();

            $course->CourseStatus = 'draft';
            $course->save();

            $previousApprovers = DB::table('zconnect_course_to_be_review')
                ->where('course_id', $courseId)
                ->whereIn('approval_status', ['approved', 'rejected'])
                ->pluck('user_info_id')
                ->toArray();

            $updatedCount = DB::table('zconnect_course_to_be_review')
                ->where('course_id', $courseId)
                ->whereIn('user_info_id', $previousApprovers)
                ->update([
                    'approval_status' => 'pending',
                    'feedback' => null,
                    'updated_at' => now(),
                ]);

            if ($reason) {
                $existingResubmission = DB::table('zconnect_course_resubmissions')
                    ->where('course_id', $courseId)
                    ->first();

                if ($existingResubmission) {
                    DB::table('zconnect_course_resubmissions')
                        ->where('course_id', $courseId)
                        ->update([
                            'Reason' => $reason,
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('zconnect_course_resubmissions')->insert([
                        'course_id' => $courseId,
                        'Reason' => $reason,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            ZCompELearnUserReports::create([
                'user_info_id' => $userInfo->id,
                'Action' => 'Reassigned Course Reviewers',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $courseName,
                    'Reason' => $reason ?? 'No reason provided',
                    'Affected Reviewers' => $previousApprovers,
                ],
                'timestamp' => now(),
            ]);

            $permittedUsers = UserInfos::whereIn('id', $previousApprovers)->get();

            foreach ($permittedUsers as $permittedUser) {
                $permittedUserFullName = trim("{$permittedUser->first_name} {$permittedUser->middle_name} {$permittedUser->last_name}");
                if ($permittedUser->name_suffix) {
                    $permittedUserFullName .= ' ' . $permittedUser->name_suffix;
                }

                $notificationData = [
                    'CourseName' => $courseName,
                    'user_info_id' => $permittedUser->id,
                    'user_credentials_id' => $permittedUser->user_credentials_id,
                    'course_id' => $course->id,
                    'assignerName' => $assignerName,
                    'message' => "The course \"{$courseName}\" has been submitted for re-approval by {$assignerName}.",
                    'created_at' => now()->setTimezone('Asia/Manila')->toDateTimeString(),
                ];
// \Log::info("check this cuz: " . json_encode($notificationData));

                ZCompELearnNotificationMessage::create([
                    'user_info_id' => $notificationData['user_info_id'],
                    'course_id' => $notificationData['course_id'],
                    'CourseName' => $notificationData['CourseName'],
                    'AssignerName' => $notificationData['assignerName'],
                    'Message' => $notificationData['message'],
                    'ReadAt' => null,
                ]);

                $courseUrl = "https://mb-authoringtool.online/SubjectMatterExpert/preview/{$courseId}";

                event(new ViewerAssign($notificationData));
                if ($permittedUser->userCredentials) {$permittedUser->userCredentials->notify(new ZConnectSubmissionForReApproval($courseName, $assignerName, $permittedUserFullName, $courseUrl));}
                event(new ZCourseAssignmentUpdated($permittedUser->id));

            }

            DB::commit();

            return response()->json([
                'message' => "Course reassigned successfully. {$updatedCount} approvals updated to pending."
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Failed to reassign viewers: {$e->getMessage()}");
            return response()->json([
                'message' => 'Failed to reassign viewers.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getCourseReApprovalReasonData($courseId)
    {
        $reasonRecord = DB::table('zconnect_course_resubmissions')
            ->where('course_id', $courseId)
            ->first();

        $reasonText = $reasonRecord ? $reasonRecord->Reason : null;

        return response()->json([
            'resubmission_reason' => $reasonText,
        ]);
    }

    public function fetchOtherApprovers($courseId)
    {
        $currentUserId = Auth::user()->userInfos->id ?? null;

        $viewers = ZCompELearnCourseViewer::with('userInfo.userCredentials')
            ->where('course_id', $courseId)
            ->where('user_info_id', '!=', $currentUserId)
            ->get()
            ->map(function ($viewer) {
                $userInfo = $viewer->userInfo;
                $userCredentials = $userInfo->userCredentials ?? null;

                $userName = 'N/A';
                if ($userInfo) {
                    $userName = trim(
                        $userInfo->first_name . ' ' .
                        ($userInfo->middle_name ? strtoupper($userInfo->middle_name[0]) . '. ' : '') .
                        $userInfo->last_name .
                        ($userInfo->name_suffix ? ', ' . $userInfo->name_suffix : '')
                    );
                }

                return [
                    'id' => $viewer->id,
                    'user_name' => $userName,
                    'employee_id' => $userInfo->employeeID ?? 'N/A',
                    'email' => $userCredentials->MBemail ?? 'N/A',
                    'profile_image' => $userInfo->profile_image ?? null,
                    'approval_status' => $viewer->approval_status ?? 'pending',
                    'feedback' => $viewer->feedback ?? null,
                    'updated_at' => $viewer->updated_at ? $viewer->updated_at->toDateTimeString() : null,
                ];
            });

        return response()->json($viewers);
    }
}
