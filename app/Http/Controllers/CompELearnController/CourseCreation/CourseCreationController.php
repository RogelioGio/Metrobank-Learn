<?php

namespace App\Http\Controllers\CompELearnController\CourseCreation;

use App\Http\Controllers\Controller;
use App\Models\ZCompELearnCustomBlock;
use App\Events\CompELearnEvent\ZCourseVersionUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

use App\Models\ZCompELearnCourse;
use App\Models\ZCompELearnLesson;
use App\Models\ZCompELearnTest;
use App\Models\ZCompELearnAttachment;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnUserReports;
use App\Models\ZCompELearnCourseVersionHistory;
use App\Models\Department;
use App\Models\User;

class CourseCreationController extends Controller
{
    public function fetchDepartments()
    {
        $departments = Department::select('department_name')->get();

        return response()->json($departments);
    }

    public function uploadImageBanner(Request $request, $courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'ImagePath' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('ImagePath')->store('CourseThumbnails', 'public');

        $course = ZCompELearnCreatedCourse::findOrFail($courseId);

        $oldImagePath = $course->ImagePath;

        $course->ImagePath = Storage::disk('public')->url($path);
        $course->save();

        ZCompELearnCourseVersionHistory::create([
            'CourseID' => $courseId,
            'UserInfoID' => $userInfoId,
            'Action' => 'Updated Course Thumbnail',
            'Changes' => [
                'Thumbnail' => [
                    'old' => $oldImagePath,
                    'new' => $course->ImagePath,
                ],
            ],
        ]);

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Updated Course Thumbnail',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'OldImage Path' => $oldImagePath,
                'NewImage Path' => $course->ImagePath,
            ],
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Thumbnail uploaded successfully.',
            'path' => $course->ImagePath,
        ]);
    }



    public function updateCourseInformation(Request $request, $courseId)
    {
        $validatedData = $request->validate([
            'courseName'   => 'required|string|max:255',
            'category'     => 'required|integer|exists:categories,id',
            'TrainingType' => 'required|string|max:100',
            'level'        => 'required|integer|exists:career_levels,id',
            'Division'     => 'required|string',
        ]);

        $course = ZCompELearnCreatedCourse::findOrFail($courseId);

        $course->CourseName     = $validatedData['courseName'];
        $course->category_id    = $validatedData['category'];
        $course->TrainingType   = $validatedData['TrainingType'];
        $course->career_level_id = $validatedData['level'];
        $course->Division = $validatedData['Division'];

        $course->save();

        return response()->json($course);
    }
    public function updateCourseDetails(Request $request, $id)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'Overview' => 'nullable|string',
            'Objective' => 'nullable|string',
        ]);

        $course = ZCompELearnCreatedCourse::findOrFail($id);

        $oldOverview = $course->Overview;
        $oldObjective = $course->Objective;

        if (array_key_exists('Overview', $validated)) {
            $course->Overview = $validated['Overview'];
        }

        if (array_key_exists('Objective', $validated)) {
            $course->Objective = $validated['Objective'];
        }

        $course->save();

        $changes = [];
        if ($oldOverview !== $course->Overview) {
            $changes['Overview'] = [
                'old' => $oldOverview,
                'new' => $course->Overview,
            ];
        }

        if ($oldObjective !== $course->Objective) {
            $changes['Objective'] = [
                'old' => $oldObjective,
                'new' => $course->Objective,
            ];
        }

        if (!empty($changes)) {
            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $id,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Course Details',
                'Changes' => $changes,
            ]);

            event(new ZCourseVersionUpdated($id));
        }

        $logDetails = [
            'CourseID' => $course->CourseID,
            'CourseName' => $course->CourseName,
            'OldOverview' => $oldOverview,
            'NewOverview' => $course->Overview,
            'OldObjective' => $oldObjective,
            'NewObjective' => $course->Objective,
        ];

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Updated Course',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Old Overview' => $oldOverview,
                'New Overview' => $course->Overview,
                'Old Objective' => $oldObjective,
                'New Objective' => $course->Objective,
            ],
            'timestamp' => now(),
        ]);

        return response()->json($course);
    }


    public function postModuleItem(Request $request, $courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'courseId' => 'required|integer',
            'modules' => 'required|array',
            'modules.*.id' => 'required',
            'modules.*.title' => 'required|string|max:255',
            'modules.*.type' => 'required|string|in:module,assessment,file,video',
            'modules.*.unsave' => 'sometimes|boolean',
            'modules.*.currentOrderPosition' => 'required|integer',
        ]);

        $course = ZCompELearnCreatedCourse::findOrFail($validated['courseId']);
        $changes = [];
        $newModules = [];
        $addedDuration = 0;

        foreach ($validated['modules'] as $module) {
            $isNew = isset($module['unsave']) && $module['unsave'] === true;
            $model = null;

            switch ($module['type']) {
                case 'module':
                    $modelClass = ZCompELearnLesson::class;
                    $fieldName = 'LessonName';
                    break;
                case 'assessment':
                    $modelClass = ZCompELearnTest::class;
                    $fieldName = 'TestName';
                    break;
                case 'file':
                    $modelClass = ZCompELearnAttachment::class;
                    $fieldName = 'FileName';
                    break;
                case 'video':
                    $modelClass = ZCompELearnAttachment::class;
                    $fieldName = 'VideoName';
                    break;
                default:
                    continue 2;
            }

            if ($isNew) {
                $model = $modelClass::create([
                    $fieldName => $module['title'],
                    'course_id' => $validated['courseId'],
                    'currentOrderPosition' => $module['currentOrderPosition'],
                ]);

                switch ($module['type']) {
                    case 'module':
                        $addedDuration += 30;
                        break;
                    case 'assessment':
                        $addedDuration += 1;
                        break;
                    case 'file':
                    case 'video':
                        $addedDuration += 10;
                        break;
                }

                $newModules[] = [
                    'id' => $model->id,
                    'type' => $module['type'],
                    'title' => $module['title'],
                ];

                ZCompELearnUserReports::create([
                    'user_info_id' => $userInfoId,
                    'Action' => 'Added Module to Course',
                    'Details' => [
                        'CourseID' => $course->CourseID,
                        'Course Name' => $course->CourseName,
                        'Module Title' => $module['title'],
                        'Module Type' => $module['type'],
                        'Order Position' => $module['currentOrderPosition'],
                    ],
                    'timestamp' => now(),
                ]);

                $typeKey = $module['type'] === 'module' ? 'Lesson' : ucfirst($module['type']);
                if (!isset($changes[$typeKey])) {
                    $changes[$typeKey] = [];
                }
                $changes[$typeKey][] = [
                    'field' => $typeKey,
                    'title' => "{$typeKey} Added",
                    'old' => null,
                    'new' => $module['title'],
                ];

            } else {
                $modelClass::where('id', $module['id'])->update([
                    $fieldName => $module['title'],
                    'course_id' => $validated['courseId'],
                    'currentOrderPosition' => $module['currentOrderPosition'],
                ]);
            }
        }

        if ($addedDuration > 0) {
            $course->increment('CourseDuration', $addedDuration);
        }

        if (!empty($changes)) {
            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Added Content',
                'Changes' => $changes,
            ]);

            event(new ZCourseVersionUpdated($courseId));
        }

        return response()->json([
            'message' => 'Modules updated successfully',
            'modules' => $newModules,
        ]);
    }



    public function fetchModuleItems($courseId)
    {

        $course = ZCompELearnCreatedCourse::find($courseId);

        $overview = $course->Overview;
        $objective = $course->Objective;
        $certificate = $course->certificates->first();

        $modules = ZCompELearnLesson::where('course_id', $courseId)
            ->where("Trashed", 0)
            ->orderBy('currentOrderPosition')
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->LessonName,
                    'LessonDescription' => $lesson->LessonDescription,
                    'LessonDuration' => $lesson->LessonDuration,
                    'type' => 'module',
                    'currentOrderPosition' => $lesson->currentOrderPosition,
                    'contentHTML' => $lesson->LessonContent,
                    'content' => $lesson->LessonContentAsJSON
                ];
            });

        $assessments = ZCompELearnTest::where('course_id', $courseId)
            ->where("Trashed", 0)
            ->orderBy('currentOrderPosition')
            ->get()
            ->map(function ($test) {
                $blocks = ZCompELearnCustomBlock::where("AssessmentID", $test->id)->get();

                $blockCounts = [
                    'Multiple Choices' => $blocks->where('QuestionType', 'multipleChoice')->count(),
                    'True or False' => $blocks->where('QuestionType', 'trueOrfalse')->count(),
                    'Identification' => $blocks->where('QuestionType', 'oneWordIdentification')->count(),
                    'Fill in The Blanks' => $blocks->where('QuestionType', 'multipleWordIdentification')->count(),
                    'Likert Scale' => $blocks->where('QuestionType', 'likert')->count(),
                ];

                return [
                    'id' => $test->id,
                    'title' => $test->TestName,
                    'TestDescription' => $test->TestDescription,
                    'AssessmentDuration' => $test->AssessmentDuration,
                    'type' => 'assessment',
                    'currentOrderPosition' => $test->currentOrderPosition,
                    'content' => ZCompELearnCustomBlock::where("AssessmentID", $test->id)->get(),
                    'blockCounts' => $blockCounts,
                ];
            });

        $attachments = ZCompELearnAttachment::where('course_id', $courseId)
            ->where("Trashed", 0)
            ->orderBy('currentOrderPosition')
            ->get()
            ->map(function ($attachment) {
                if (!is_null($attachment->FileName)) {
                    return [
                        'id' => $attachment->id,
                        'title' => $attachment->FileName,
                        'type' => 'file',
                        'currentOrderPosition' => $attachment->currentOrderPosition,
                        'AttachmentDescription' => $attachment->AttachmentDescription,
                        'AttachmentDuration' => $attachment->AttachmentDuration,
                        'attachmentType' => $attachment->AttachmentType,
                        'filePath' =>$attachment->FilePath
                    ];
                } elseif (!is_null($attachment->VideoName)) {
                    return [
                        'id' => $attachment->id,
                        'title' => $attachment->VideoName,
                        'type' => 'video',
                        'currentOrderPosition' => $attachment->currentOrderPosition,
                        'AttachmentDescription' => $attachment->AttachmentDescription,
                        'AttachmentDuration' => $attachment->AttachmentDuration,
                        'attachmentType' => $attachment->AttachmentType,
                        'videoPath' => $attachment->VideoPath,
                    ];
                }

                return [];
            })
            ->filter(fn ($item) => !empty($item));

        $items = collect()
            ->merge($modules)
            ->merge($assessments)
            ->merge($attachments)
            ->sortBy('currentOrderPosition')
            ->values();

        return response()->json([
            'courseId' => $courseId,
            'modules' => $items,
            'overview' => $overview,
            'objective' => $objective,
            'certificate' => $certificate,
        ]);
    }

    // public function deleteItem(Request $request)
    // {
    //     $request->validate([
    //         'type' => 'required|string',
    //         'id' => 'required|integer',
    //     ]);

    //     $type = $request->input('type');
    //     $id = $request->input('id');

    //     $model = null;

    //     switch ($type) {
    //         case 'module':
    //             $model = ZCompELearnLesson::find($id);
    //             break;
    //         case 'assessment':
    //             $model = ZCompELearnTest::find($id);
    //             break;
    //         case 'file':
    //         case 'video':
    //             $model = ZCompELearnAttachment::find($id);
    //             break;
    //         default:
    //             return response()->json(['message' => 'Invalid type'], 400);
    //     }

    //     if (!$model) {
    //         return response()->json(['message' => ucfirst($type) . ' not found'], 404);
    //     }

    //     if (in_array($type, ['video'])) {
    //         $filePath = $model->VideoPath ?? null;

    //         $filePath = $model->VideoPath ?? null;

    //         if ($filePath) {
    //             $filePath = ltrim($filePath, '/');
    //             $filePath = preg_replace('#^storage/#i', '', $filePath);

    //             \Log::info("Deleting file from storage disk public: " . $filePath);

    //             if (Storage::disk('public')->exists($filePath)) {
    //                 Storage::disk('public')->delete($filePath);
    //                 \Log::info("File deleted successfully: " . $filePath);
    //             } else {
    //                 \Log::warning("File not found in storage: " . $filePath);
    //             }
    //         }

    //     }

    //     $model->delete();

    //     return response()->json(['message' => ucfirst($type) . ' deleted successfully']);
    // }


    public function deleteItem(Request $request)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        $type = $request->input('type');
        $id = $request->input('id');

        $model = null;
        $courseId = null;
        $title = null;

        switch ($type) {
            case 'module':
                $model = ZCompELearnLesson::find($id);
                $title = $model?->LessonName;
                $courseId = $model?->course_id;
                break;
            case 'assessment':
                $model = ZCompELearnTest::find($id);
                $title = $model?->TestName;
                $courseId = $model?->course_id;
                break;
            case 'file':
                $model = ZCompELearnAttachment::find($id);
                $title = $model?->FileName;
                $courseId = $model?->course_id;
                break;
            case 'video':
                $model = ZCompELearnAttachment::find($id);
                $title = $model?->VideoName;
                $courseId = $model?->course_id;
                break;
            default:
                return response()->json(['message' => 'Invalid type'], 400);
        }

        if (!$model) {
            return response()->json(['message' => ucfirst($type) . ' not found'], 404);
        }

        $model->Trashed = 1;
        $model->DeletedAt = now();
        $model->save();

        $course = ZCompELearnCreatedCourse::find($courseId);

        $typeKey = $type === 'module' ? 'Lesson' : ucfirst($type);
        $changes = [
            $typeKey => [
                [
                    'field' => $typeKey,
                    'title' => "{$typeKey} Deleted",
                    'old' => $title,
                    'new' => null,
                ]
            ]
        ];

        ZCompELearnCourseVersionHistory::create([
            'CourseID' => $courseId,
            'UserInfoID' => $userInfoId,
            'Action' => 'Deleted Content',
            'Changes' => $changes,
        ]);

        event(new ZCourseVersionUpdated($courseId));

        // Log user activity
        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Deleted Module in Course',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Module Title' => $title,
                'Module Type' => $type,
            ],
            'timestamp' => now(),
        ]);

        return response()->json(['message' => ucfirst($type) . ' trashed successfully']);
    }




    public function fetchTrashedItems(Request $request, $courseId) 
    {
        $trashedModules = ZCompELearnLesson::where("Trashed", 1)
            ->where('course_id', $courseId)
            ->select('id', 'LessonName', 'DeletedAt')
            ->get()
            ->map(function ($item) {
                $item->title = $item->LessonName;
                $item->DeletedAt = $item->DeletedAt;
                return $item;
            });

        $trashedAssessments = ZCompELearnTest::where("Trashed", 1)
            ->where('course_id', $courseId)
            ->select('id', 'TestName', 'DeletedAt')
            ->get()
            ->map(function ($item) {
                $item->title = $item->TestName;
                $item->DeletedAt = $item->DeletedAt;
                return $item;
            });

        $trashedAttachments = ZCompELearnAttachment::where("Trashed", 1)
            ->where('course_id', $courseId)
            ->select('id', 'FileName', 'VideoName', 'DeletedAt')
            ->get()
            ->map(function ($item) {
                if (!empty($item->VideoName)) {
                    return [
                        'id' => $item->id,
                        'title' => $item->VideoName,
                        'deleted_at' => $item->DeletedAt,
                        'type' => 'video',
                    ];
                } elseif (!empty($item->FileName)) {
                    return [
                        'id' => $item->id,
                        'title' => $item->FileName,
                        'deleted_at' => $item->DeletedAt,
                        'type' => 'file',
                    ];
                }
                return null;
            })
            ->filter()
            ->values();

        $trashedVideos = $trashedAttachments->where('type', 'video')->values();
        $trashedFiles = $trashedAttachments->where('type', 'file')->values();

        return response()->json([
            'modules' => $trashedModules,
            'assessments' => $trashedAssessments,
            'files' => $trashedFiles,
            'videos' => $trashedVideos,
        ]);
    }

    public function restoreTrashedItem(Request $request)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        $type = $request->input('type');
        $id = $request->input('id');

        $model = null;
        $courseId = null;
        $title = null;

        switch ($type) {
            case 'module':
                $model = ZCompELearnLesson::find($id);
                $title = $model?->LessonName;
                $courseId = $model?->course_id;
                break;
            case 'assessment':
                $model = ZCompELearnTest::find($id);
                $title = $model?->TestName;
                $courseId = $model?->course_id;
                break;
            case 'file':
                $model = ZCompELearnAttachment::find($id);
                $title = $model?->FileName;
                $courseId = $model?->course_id;
                break;
            case 'video':
                $model = ZCompELearnAttachment::find($id);
                $title = $model?->VideoName;
                $courseId = $model?->course_id;
                break;
            default:
                return response()->json(['message' => 'Invalid type provided.'], 400);
        }

        if (!$model) {
            return response()->json(['message' => ucfirst($type) . ' not found.'], 404);
        }

        $model->Trashed = 0;
        $model->DeletedAt = null;
        $model->save();

        $course = ZCompELearnCreatedCourse::find($courseId);

        $typeKey = $type === 'module' ? 'Lesson' : ucfirst($type);
        $changes = [
            $typeKey => [
                [
                    'field' => $typeKey,
                    'title' => "{$typeKey} Restored",
                    'old' => null,
                    'new' => $title,
                ]
            ]
        ];

        ZCompELearnCourseVersionHistory::create([
            'CourseID' => $courseId,
            'UserInfoID' => $userInfoId,
            'Action' => 'Restored Content',
            'Changes' => $changes,
        ]);

        event(new ZCourseVersionUpdated($courseId));

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Restored Module in Course',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
                'Module Title' => $title,
                'Module Type' => $type,
            ],
            'timestamp' => now(),
        ]);

        return response()->json(['message' => ucfirst($type) . ' restored successfully.']);
    }


}
