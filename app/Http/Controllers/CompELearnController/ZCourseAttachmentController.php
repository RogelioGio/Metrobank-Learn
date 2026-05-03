<?php

namespace App\Http\Controllers\CompELearnController;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Models\ZCompELearnAttachment;
use App\Models\ZCompELearnCourseVersionHistory;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnUserReports;

class ZCourseAttachmentController extends Controller
{

    public function fetchAttachment($attachmentId)
    {
        $attachment = ZCompELearnAttachment::find($attachmentId);

        return response()->json([
            'id' => $attachment->id,
            'FileName' => $attachment->FileName,
            'FilePath' => $attachment->FilePath,
            'VideoName' => $attachment->VideoName,
            'VideoPath' => $attachment->VideoPath,
            'AttachmentDescription' => $attachment->AttachmentDescription,
            'AttachmentDuration' => $attachment->AttachmentDuration,
            'AttachmentType' => $attachment->AttachmentType,
            'course_id' => $attachment->course_id,
        ]);
    }

    public function uploadedFile($id)
    {
        $attachment = FileAttachment::find($id);

        if (!$attachment || !$attachment->FilePath) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $filePath = $attachment->FilePath;

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'File not found on storage'], 404);
        }

        return Storage::disk('public')->download($filePath, $attachment->FileName ?? basename($filePath));
    }
    
    public function updateVideoAttachment(Request $request, $attachmentId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated= $request->validate([
            'VideoName' => 'nullable|string|max:255',
            'VideoPath' => 'nullable|string',
            'AttachmentDescription' => 'nullable|string',
            'AttachmentType' => 'nullable|string|max:255',
            'AttachmentDuration' => 'nullable|integer|min:10|max:360',
        ]);

        $attachment = ZCompELearnAttachment::find($attachmentId);

        if (!$attachment) {
            return response()->json(['message' => 'Attachment not found'], 404);
        }

        $oldValues = [
            'VideoName' => $attachment->VideoName,
            'VideoPath' => $attachment->VideoPath,
            'AttachmentDescription' => $attachment->AttachmentDescription,
            'AttachmentType' => $attachment->AttachmentType,
            'AttachmentDuration' => $attachment->AttachmentDuration,
        ];

        $attachment->VideoName = $validated['VideoName'] ?? $attachment->VideoName;
        $attachment->AttachmentDescription = $validated['AttachmentDescription'] ?? $attachment->AttachmentDescription;
        $attachment->AttachmentType = $validated['AttachmentType'] ?? $attachment->AttachmentType;
        $attachment->AttachmentDuration = $validated['AttachmentDuration'] ?? $attachment->AttachmentDuration;

        if ($attachment->AttachmentType === 'link') {
            $request->validate([
                'VideoPath' => 'nullable|url',
            ]);
            if ($request->filled('VideoPath')) {
                $attachment->VideoPath = $request->input('VideoPath');
            }
        }

        $oldDuration = $attachment->AttachmentDuration ?? 0;
        $newDuration = $validated['AttachmentDuration'] ?? $oldDuration;
        $attachment->AttachmentDuration = $newDuration;

        $newDuration = $attachment->AttachmentDuration;

        $attachment->save();

        if ($oldDuration !== $newDuration) {
            $course = ZCompELearnCreatedCourse::find($attachment->course_id);
            if ($course) {
                $course->CourseDuration += ($newDuration - $oldDuration);
                if ($course->CourseDuration < 0) {
                    $course->CourseDuration = 0;
                }
                $course->save();
            }
        }

        $changes = [];
        foreach ($oldValues as $field => $oldValue) {
            $newValue = $attachment->$field;
            if ($oldValue !== $newValue) {
                $changes[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        if (!empty($changes)) {
            $courseId = $attachment->course_id;
            $course = ZCompELearnCreatedCourse::find($courseId);

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Video Attachment',
                'Changes' => $changes,
            ]);

            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Updated Video Attachment',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName,
                    'VideoName' => $attachment->VideoName,
                    'AttachmentID' => $attachmentId,
                ],
                'timestamp' => now(),
            ]);

        }

        return response()->json([
            'message' => 'Attachment updated successfully',
            'attachment' => $attachment,
        ]);
    }
    public function deleteVideoAttachment($attachmentId)
    {
        $attachment = ZCompELearnAttachment::find($attachmentId);

        if (!$attachment) {
            return response()->json(['message' => 'Attachment not found'], 404);
        }

        if ($attachment->VideoPath && file_exists(storage_path('app/public/' . $attachment->VideoPath))) {
            unlink(storage_path('app/public/' . $attachment->VideoPath));
        }

        $attachment->VideoPath = null;
        $attachment->save();

        return response()->json(['message' => 'Video attachment deleted successfully']);
    }

    public function updateFileAttachment(Request $request, $attachmentId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'FileName' => 'nullable|string|max:255',
            'FilePath' => 'nullable|string',
            'AttachmentType' => 'nullable|string|max:255',
            'AttachmentDuration' => 'nullable|integer|min:10|max:360',
        ]);

        $attachment = ZCompELearnAttachment::find($attachmentId);

        if (!$attachment) {
            return response()->json(['message' => 'Attachment not found'], 404);
        }

        $oldFileName = $attachment->FileName;
        $oldFilePath = $attachment->FilePath;
        $oldAttachmentType = $attachment->AttachmentType;
        $oldAttachmentDuration = $attachment->AttachmentDuration ?? 0;

        $attachment->FileName = $validated['FileName'] ?? $attachment->FileName;
        $attachment->AttachmentType = $validated['AttachmentType'] ?? $attachment->AttachmentType;

        if ($attachment->AttachmentType === 'link' && isset($validated['FilePath'])) {
            $attachment->FilePath = $validated['FilePath'];
        }

        $attachment->AttachmentDuration = $validated['AttachmentDuration'] ?? $oldAttachmentDuration;

        $attachment->save();

        if ($oldAttachmentDuration !== $attachment->AttachmentDuration) {
            $course = ZCompELearnCreatedCourse::find($attachment->course_id);
            if ($course) {
                $course->CourseDuration += ($attachment->AttachmentDuration - $oldAttachmentDuration);
                if ($course->CourseDuration < 0) {
                    $course->CourseDuration = 0;
                }
                $course->save();
            }
        }

        $changes = [];
        if ($oldFileName !== $attachment->FileName) {
            $changes['Attachment Name'] = [
                'old' => $oldFileName,
                'new' => $attachment->FileName,
            ];
        }

        if ($oldFilePath !== $attachment->FilePath) {
            $changes['Attachment Path'] = [
                'old' => $oldFilePath,
                'new' => $attachment->FilePath,
            ];
        }

        if ($oldAttachmentType !== $attachment->AttachmentType) {
            $changes['Attachment Type'] = [
                'old' => $oldAttachmentType,
                'new' => $attachment->AttachmentType,
            ];
        }

        if ($oldAttachmentDuration !== $attachment->AttachmentDuration) {
            $changes['Attachment Duration'] = [
                'old' => $oldAttachmentDuration,
                'new' => $attachment->AttachmentDuration,
            ];
        }

        if (!empty($changes)) {
            $courseId = $attachment->course_id;
            $course = ZCompELearnCreatedCourse::find($courseId);

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Attachment Details',
                'Changes' => $changes,
            ]);

            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Updated Attachment Details',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName,
                    'FileName' => $attachment->FileName,
                    'AttachmentID' => $attachmentId,
                ],
                'timestamp' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Attachment updated successfully',
            'attachment' => $attachment,
        ]);
    }

    public function deleteFileAttachment($attachmentId)
    {
        $attachment = ZCompELearnAttachment::find($attachmentId);

        if (!$attachment) {
            return response()->json(['message' => 'Attachment not found'], 404);
        }

        if ($attachment->FilePath && file_exists(storage_path('app/public/' . $attachment->FilePath))) {
            unlink(storage_path('app/public/' . $attachment->FilePath));
        }

        $attachment->FilePath = null;
        $attachment->save();

        return response()->json(['message' => 'Attachment file deleted successfully']);
    }


    public function uploadVideoFile(Request $request, $attachmentId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'file' => 'required|file|mimetypes:video/mp4,video/avi,video/mpeg,video/quicktime|max:512000',
        ]);

        $attachment = ZCompELearnAttachment::findOrFail($attachmentId);

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $oldPath = $attachment->VideoPath;

            if ($oldPath) {
                $baseUrl = env('APP_URL') . '/storage/';
                $oldStoragePath = str_replace($baseUrl, '', $oldPath);

                if (Storage::disk('public')->exists($oldStoragePath)) {
                    Storage::disk('public')->delete($oldStoragePath);
                }
            }

            $path = $file->store('VideoAttachment', 'public');
            $url = Storage::disk('public')->url($path);

            $attachment->VideoPath = $url;
            $attachment->save();

            // Version history logging
            $courseId = $attachment->course_id;
            $course = ZCompELearnCreatedCourse::find($courseId);

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Added Content',
                'Changes' => [
                    'VideoAttachment' => [
                        [
                            'field' => 'Video File',
                            'title' => 'Video File Uploaded',
                            'old' => $oldPath,
                            'new' => $url,
                        ],
                    ],
                ],
            ]);

            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Uploaded Video File',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName,
                    'AttachmentID' => $attachmentId,
                    'Old Video Path' => $oldPath,
                    'New Video Path' => $url,
                ],
                'timestamp' => now(),
            ]);

            return response()->json([
                'VideoPath' => $url,
                'message' => 'Video uploaded and VideoPath updated successfully',
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
    public function uploadDocumentFile(Request $request, $attachmentId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'file' => 'required|file|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain|max:512000',
        ]);

        $attachment = ZCompELearnAttachment::findOrFail($attachmentId);

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $oldPath = $attachment->FilePath;

            if ($oldPath) {
                $baseUrl = env('APP_URL') . '/storage/';
                $oldStoragePath = str_replace($baseUrl, '', $oldPath);

                if (Storage::disk('public')->exists($oldStoragePath)) {
                    Storage::disk('public')->delete($oldStoragePath);
                }
            }

            $path = $file->store('DocumentAttachment', 'public');
            $url = Storage::disk('public')->url($path);

            $attachment->FilePath = $url;
            $attachment->save();

            // Version history logging
            $courseId = $attachment->course_id;
            $course = ZCompELearnCreatedCourse::find($courseId);

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Added Content',
                'Changes' => [
                    'DocumentAttachment' => [
                        [
                            'field' => 'Document File',
                            'title' => 'Document File Uploaded',
                            'old' => $oldPath,
                            'new' => $url,
                        ],
                    ],
                ],
            ]);

            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Uploaded Document File',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName,
                    'AttachmentID' => $attachmentId,
                    'Old File Path' => $oldPath,
                    'New File Path' => $url,
                ],
                'timestamp' => now(),
            ]);

            return response()->json([
                'FilePath' => $url,
                'message' => 'Document uploaded and FilePath updated successfully',
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}