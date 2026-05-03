<?php

namespace App\Http\Controllers\CompELearnController\Course;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ZCompELearnCourseVersionHistory;

class ZConnectCourseVersionHistory extends Controller
{
    public function fetchCourseVersionHistory($courseId)
    {
        $versions = ZCompELearnCourseVersionHistory::with('userInfo')
            ->where('CourseID', $courseId)
            ->orderBy('created_at', 'desc')
            ->get();

        $versionCount = $versions->count();

        $formattedVersions = $versions->map(function ($version, $index) use ($versionCount) {
            $rawChanges = $version->Changes;

            $changes = [];
            $lessonName = $rawChanges['LessonName']['new'] ?? null;
            $assessmentName = $rawChanges['AssessmentName']['new'] ?? null;
            $attachmentName = 
                $rawChanges['AttachmentName']['new'] ?? 
                $rawChanges['VideoName']['new'] ?? 
                $rawChanges['FileName']['new'] ?? 
                null;

            foreach ($rawChanges as $field => $changeData) {
                if ($field === 'LessonName') {
                    $lessonName = $changeData['new'] ?? null;
                    continue;
                }
                if ($field === 'AssessmentName') {
                    $assessmentName = $changeData['new'] ?? null;
                    continue;
                }
                if ($field === 'AttachmentName') {
                    $attachmentName = $changeData['new'] ?? null;
                    continue;
                }

                if (is_array($changeData) && isset($changeData[0]) && is_array($changeData[0])) {
                    foreach ($changeData as $change) {
                        $oldValue = $change['old'] ?? null;
                        $newValue = $change['new'] ?? null;
                        $fieldName = $change['field'] ?? $field;
                        $title = $change['title'] ?? "{$fieldName} Updated";

                        if ($fieldName === 'Lesson Content') 
                        {
                            $summary = "Module Added";
                        } 
                        elseif ($fieldName === 'Assessment Content') 
                        {
                            $oldCount = is_array($oldValue) ? count($oldValue) : 0;
                            $newCount = is_array($newValue) ? count($newValue) : 0;
                            $summary = "Updated assessment questions: from {$oldCount} to {$newCount} question(s).";
                        } 
                        elseif (in_array($field, ['Lesson Name', 'Lesson Description', 'Lesson Duration', 'Assesment Name', 'Assessment Description', 'Assessment Duration']))
                        {
                            $summary = "Updated {$field} from \"" . ($oldValue ?? 'null') . "\" to \"" . ($newValue ?? 'null') . "\".";
                        }
                        elseif (in_array($fieldName, ['VideoName', 'FileName', 'AttachmentName', 'AttachmentDescription', 'AttachmentType'])) 
                        {
                            $summary = $attachmentName
                                ? "Updated Attachment Details for Attachment: {$attachmentName}."
                                : "Updated Attachment Content.";
                        }
                        else
                        {
                            $oldStr = is_scalar($oldValue) ? $oldValue : json_encode($oldValue);
                            $newStr = is_scalar($newValue) ? $newValue : json_encode($newValue);
                            $summary = "Updated {$fieldName} from \"{$oldStr}\" to \"{$newStr}\".";
                        }

                        $changes[] = [
                            'field' => $fieldName,
                            'title' => $title,
                            'summary' => $summary,
                            'old' => $oldValue,
                            'new' => $newValue,
                        ];
                    }
                } else {
                    $oldValue = $changeData['old'] ?? null;
                    $newValue = $changeData['new'] ?? null;
                    $fieldName = $field;

                    if ($fieldName === 'Lesson Content') {
                        $summary = $lessonName 
                            ? "Updated Lesson Content for Lesson: {$lessonName}." 
                            : "Updated Lesson Content.";
                    } elseif ($fieldName === 'Assessment Content') {
                        $summary = $assessmentName 
                            ? "Updated Assessment Content for Assessment: {$assessmentName}." 
                            : "Updated Assessment Content.";
                    } elseif (in_array($fieldName, ['VideoName', 'FileName', 'AttachmentName', 'AttachmentDescription', 'AttachmentType'])) {
                        $summary = $attachmentName
                            ? "Updated Attachment Details for Attachment: {$attachmentName}."
                            : "Updated Attachment Content.";
                    } elseif ($fieldName === 'Attachment') {
                        $summary = $attachmentName 
                            ? "Updated Attachment Content for Attachment: {$attachmentName}." 
                            : "Updated Attachment Content.";
                    } else {
                        $oldStr = is_scalar($oldValue) ? $oldValue : json_encode($oldValue);
                        $newStr = is_scalar($newValue) ? $newValue : json_encode($newValue);
                        $summary = "Updated {$fieldName} from \"{$oldStr}\" to \"{$newStr}\".";
                    }

                    $changes[] = [
                        'field' => $fieldName,
                        'title' => "{$fieldName} Updated",
                        'summary' => $summary,
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }

            $userFullName = $version->userInfo
                ? "{$version->userInfo->first_name} {$version->userInfo->last_name}"
                : 'Unknown User';

            return [
                'versionNumber' => $versionCount - $index,
                'User' => $userFullName,
                'Date' => $version->created_at,
                'Action' => $version->Action,
                'Changes' => $changes,
            ];
        });

        return response()->json($formattedVersions);
    }

}
