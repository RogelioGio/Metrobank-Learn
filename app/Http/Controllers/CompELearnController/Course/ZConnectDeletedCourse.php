<?php

namespace App\Http\Controllers\CompELearnController\Course;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\ZCompELearnUserReports;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnDeletedCoursesRetention;
use Carbon\Carbon;

class ZConnectDeletedCourse extends Controller
{
    public function deleteCourse($courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;
        $now = Carbon::now('Asia/Manila');

        $course = ZCompELearnCreatedCourse::with([
            'lessons',
            'tests.customBlocks',
            'certificates.creditors',
            'attachments'
        ])->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        DB::transaction(function () use ($course, $now, $userInfoId) {
            $course->update([
                'DeletedAt'    => $now,
                'CourseStatus' => 'deleted',
            ]);

            \Log::info('Course deleted', [
                'course_id' => $course->id,
                'DeletedAt' => $now,
            ]);

            DB::table('zconnect_deleted_content')->insert([
                'CourseID'     => $course->id,
                'LessonID'     => null,
                'TestID'       => null,
                'AttachmentID' => null,
                'DeletedAt'    => $now,
                'ArchivedAt'   => null,
                'created_at'   => $now,
                'updated_at'   => $now
            ]);

            foreach ($course->lessons as $lesson) {
                $lesson->update(['DeletedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => $lesson->id,
                    'TestID'       => null,
                    'AttachmentID' => null,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }

            foreach ($course->tests as $test) {
                $test->update(['DeletedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => $test->id,
                    'AttachmentID' => null,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);

                foreach ($test->customBlocks as $block) {
                    $block->update(['DeletedAt' => $now]);
                }
            }

            foreach ($course->certificates as $certificate) {
                $certificate->update(['DeletedAt' => $now]);

                foreach ($certificate->creditors as $creditor) {
                    $creditor->update(['DeletedAt' => $now]);
                }
            }

            foreach ($course->attachments as $attachment) {
                $attachment->update(['DeletedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => null,
                    'AttachmentID' => $attachment->id,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }
            
        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Deleted Course',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
            ],
            'timestamp' => $now,
        ]);

        });

        return response()->json(['message' => 'Course and related data soft deleted successfully']);
    }

    public function hardDeleteCourse(Request $request, $courseId) 
    {
        $course = ZCompELearnCreatedCourse::with([
            'careerLevel',
            'category',
            'userInfo',
            'lessons',
            'tests.customBlocks',
            'certificates'
        ])->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $html = view('certificate.courseTemplate', compact('course'))->render();

        DB::transaction(function () use ($course) {
            foreach ($course->lessons as $lesson) {
                $lesson->delete();
            }

            foreach ($course->tests as $test) {
                foreach ($test->customBlocks as $block) {
                    $block->delete();
                }
                $test->delete();
            }

            foreach ($course->certificates as $certificate) {
                $certificate->delete();
            }

            foreach ($course->attachments as $attachment) {
                $attachment->delete();
            }

            DB::table('zconnect_deleted_content')->where('CourseID', $course->id)->delete();

            $course->delete();
        });

        return response()->json([
            'message' => 'Course permanently deleted',
            'html' => $html,
        ]);
    }



    public function archiveCourse($courseId)
    {
        $now = now();

        $course = ZCompELearnCreatedCourse::with([
            'lessons',
            'tests.customBlocks',
            'certificates.creditors',
            'attachments'
        ])->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        DB::transaction(function () use ($course, $now, $userInfoId) {
            $course->update([
                'ArchivedAt'    => $now,
                'CourseStatus' => 'archived',
            ]);

            DB::table('zconnect_deleted_content')->insert([
                'CourseID'     => $course->id,
                'LessonID'     => null,
                'TestID'       => null,
                'AttachmentID' => null,
                'DeletedAt'    => null,
                'ArchivedAt'   => $now,
                'created_at'   => $now,
                'updated_at'   => $now
            ]);

            foreach ($course->lessons as $lesson) {
                $lesson->update(['ArchivedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => $lesson->id,
                    'TestID'       => null,
                    'AttachmentID' => null,
                    'DeletedAt'    => null,
                    'ArchivedAt'   => $now,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }

            foreach ($course->tests as $test) {
                $test->update(['ArchivedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => $test->id,
                    'AttachmentID' => null,
                    'DeletedAt'    => null,
                    'ArchivedAt'   => $now,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);

                foreach ($test->customBlocks as $block) {
                    $block->update(['ArchivedAt' => $now]);
                }
            }

            foreach ($course->certificates as $certificate) {
                $certificate->update(['ArchivedAt' => $now]);

                foreach ($certificate->creditors as $creditor) {
                    $creditor->update(['ArchivedAt' => $now]);
                }
            }

            foreach ($course->attachments as $attachment) {
                $attachment->update(['ArchivedAt' => $now]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => null,
                    'AttachmentID' => $attachment->id,
                    'DeletedAt'    => null,
                    'ArchivedAt'   => $now,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }
        });

        if ($userInfoId) {
            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Archived Course',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName ?? $course->course_name ?? 'N/A',
                ],
                'timestamp' => $now,
            ]);
        }

        return response()->json(['message' => 'Course and related data archived successfully']);
    }


    public function deleteArchivedCourse($courseId)
    {
        $now = Carbon::now('Asia/Manila');

        $course = ZCompELearnCreatedCourse::with([
            'lessons',
            'tests.customBlocks',
            'certificates.creditors',
            'attachments'
        ])->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        if (!$course->ArchivedAt) {
            return response()->json(['message' => 'Course is not archived'], 400);
        }

        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        DB::transaction(function () use ($course, $now) {
            $course->update([
                'DeletedAt'    => $now,
                'CourseStatus' => 'deleted',
                'ArchivedAt'   => null,
            ]);

            \Log::info('Archived course deleted', [
                'course_id' => $course->id,
                'DeletedAt' => $now,
            ]);

            DB::table('zconnect_deleted_content')->insert([
                'CourseID'     => $course->id,
                'LessonID'     => null,
                'TestID'       => null,
                'AttachmentID' => null,
                'DeletedAt'    => $now,
                'ArchivedAt'   => null,
                'created_at'   => $now,
                'updated_at'   => $now
            ]);

            foreach ($course->lessons as $lesson) {
                $lesson->update([
                    'DeletedAt'  => $now,
                    'ArchivedAt' => null,
                ]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => $lesson->id,
                    'TestID'       => null,
                    'AttachmentID' => null,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }

            foreach ($course->tests as $test) {
                $test->update([
                    'DeletedAt'  => $now,
                    'ArchivedAt' => null,
                ]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => $test->id,
                    'AttachmentID' => null,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);

                foreach ($test->customBlocks as $block) {
                    $block->update([
                        'DeletedAt'  => $now,
                        'ArchivedAt' => null,
                    ]);
                }
            }

            foreach ($course->certificates as $certificate) {
                $certificate->update([
                    'DeletedAt'  => $now,
                    'ArchivedAt' => null,
                ]);

                foreach ($certificate->creditors as $creditor) {
                    $creditor->update([
                        'DeletedAt'  => $now,
                        'ArchivedAt' => null,
                    ]);
                }
            }

            foreach ($course->attachments as $attachment) {
                $attachment->update([
                    'DeletedAt'  => $now,
                    'ArchivedAt' => null,
                ]);

                DB::table('zconnect_deleted_content')->insert([
                    'CourseID'     => $course->id,
                    'LessonID'     => null,
                    'TestID'       => null,
                    'AttachmentID' => $attachment->id,
                    'DeletedAt'    => $now,
                    'ArchivedAt'   => null,
                    'created_at'   => $now,
                    'updated_at'   => $now
                ]);
            }
        });

        if ($userInfoId) {
            ZCompELearnUserReports::create([
                'user_info_id' => $userInfoId,
                'Action' => 'Deleted Archived Course',
                'Details' => [
                    'CourseID' => $course->CourseID,
                    'Course Name' => $course->CourseName ?? $course->course_name ?? 'N/A',
                ],
                'timestamp' => $now,
            ]);
        }

        return response()->json(['message' => 'Archived course and related data soft deleted successfully']);
    }


    public function restoreCourse($courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $course = ZCompELearnCreatedCourse::with([
            'lessons',
            'tests.customBlocks',
            'certificates.creditors',
            'attachments'
        ])->find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        DB::transaction(function () use ($course) {
            $course->update([
                'DeletedAt'    => null,
                'CourseStatus' => 'created',
            ]);

            DB::table('zconnect_deleted_content')->where('CourseID', $course->id)->delete();

            foreach ($course->lessons as $lesson) {
                $lesson->update(['DeletedAt' => null]);
            }

            foreach ($course->tests as $test) {
                $test->update(['DeletedAt' => null]);

                foreach ($test->customBlocks as $block) {
                    $block->update(['DeletedAt' => null]);
                }
            }

            foreach ($course->certificates as $certificate) {
                $certificate->update(['DeletedAt' => null]);

                foreach ($certificate->creditors as $creditor) {
                    $creditor->update(['DeletedAt' => null]);
                }
            }

            foreach ($course->attachments as $attachment) {
                $attachment->update(['DeletedAt' => null]);
            }
        });

        ZCompELearnUserReports::create([
            'user_info_id' => $userInfoId,
            'Action' => 'Restored Course',
            'Details' => [
                'CourseID' => $course->CourseID,
                'Course Name' => $course->CourseName,
            ],
            'timestamp' => now(),
        ]);

        return response()->json(['message' => 'Course and related data restored successfully']);
    }

    public function restoreInactiveCourse($courseId)
    {
        $course = ZCompELearnCreatedCourse::find($courseId);

        \Log::info($course);
        
        $course->CourseStatus = 'distributed';
        $course->save();
    }

    public function fetchDeletedCourseSettings()
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;
        $settings = ZCompELearnDeletedCoursesRetention::where('user_info_id', $userInfoId)->first();

        if ($settings) {
            $retentionValue = $settings->RetentionValue;
            $retentionUnit = $settings->RetentionUnit;
            $AutoDelete = $settings->AutoDelete ?? 1;
        } else {
            $retentionValue = 1;
            $retentionUnit = 'days';
            $AutoDelete = 1;
        }

        return response()->json([
            'RetentionValue' => $retentionValue,
            'RetentionUnit' => $retentionUnit,
            'AutoDelete' => $AutoDelete,
        ]);
    }

    public function updateDeletedCourseSettings(Request $request)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'RetentionValue' => ['nullable', 'required_if:AutoDelete,1', 'integer', 'min:1'],
            'RetentionUnit' => ['nullable', 'required_if:AutoDelete,1', Rule::in(['days', 'weeks', 'months'])],
            'AutoDelete' => ['required', 'integer', 'in:0,1'],
        ]);

        $retention = ZCompELearnDeletedCoursesRetention::updateOrCreate(
            ['user_info_id' => $userInfoId],
            [
                'RetentionValue' => $validated['AutoDelete'] === 1 ? $validated['RetentionValue'] : null,
                'RetentionUnit' => $validated['AutoDelete'] === 1 ? $validated['RetentionUnit'] : null,
                'AutoDelete' => $validated['AutoDelete'],
                'SettingsUpdatedAt' => now(),
            ]
        );

        return response()->json([
            'message' => "Retention settings updated.",
            'data' => $retention,
        ]);
    }



    
}
