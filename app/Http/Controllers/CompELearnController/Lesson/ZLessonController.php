<?php

namespace App\Http\Controllers\CompELearnController\Lesson;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Models\ZCompELearnLesson;
use App\Models\ZCompELearnCourseVersionHistory;

class ZLessonController extends Controller
{
  public function fetchCourseOfLesson($lessonId)
  {
      $lesson = ZCompELearnLesson::with('createdCourse')->find($lessonId);

      return response()->json($lesson->createdCourse);
  }

  public function fetchLessonContent($lessonId)
  {
    $lesson = ZCompELearnLesson::find($lessonId);

    return response()->json([
      'LessonName' => $lesson->LessonName,
      'LessonDescription' => $lesson->LessonDescription,
      'LessonContent' => $lesson->LessonContent,
      'LessonContentAsJSON' => $lesson->LessonContentAsJSON,
    ]);
  }

    public function updateLessonContent(Request $request, $lessonId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'LessonContent' => 'nullable|string',
            'LessonContentAsJSON' => 'nullable|string',
        ]);

        $lesson = ZCompELearnLesson::findOrFail($lessonId);

        $oldLessonContent = $lesson->LessonContent;

        $lesson->LessonContent = $validated['LessonContent'] ?? null;
        $lesson->LessonContentAsJSON = $validated['LessonContentAsJSON'] ?? null;
        $lesson->save();

        if ($oldLessonContent !== $lesson->LessonContent) {
            $changes = [
                'Lesson Content' => [
                    'old' => $oldLessonContent,
                    'new' => $lesson->LessonContent,
                ],
                'LessonName' => [
                    'old' => null,
                    'new' => $lesson->LessonName,
                ],
            ];

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $lesson->course_id,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Lesson Content',
                'Changes' => $changes,
            ]);
        }

        return response()->json($lesson);
    }



    public function updateLessonDetails(Request $request, $lessonId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([ 
            'LessonName' => 'nullable|string',
            'LessonDescription' => 'nullable|string',
            'LessonDuration' => 'nullable|integer|min:1|max:360',
        ]);

        $lesson = ZCompELearnLesson::findOrFail($lessonId);

        $oldLessonName = $lesson->LessonName;
        $oldLessonDescription = $lesson->LessonDescription;
        $oldLessonDuration = $lesson->LessonDuration;

        $lesson->LessonName = $validated['LessonName'] ?? $lesson->LessonName;
        $lesson->LessonDescription = $validated['LessonDescription'] ?? $lesson->LessonDescription;
        $lesson->LessonDuration = $validated['LessonDuration'] ?? $lesson->LessonDuration;
        $lesson->save();

        $course = $lesson->createdCourse;

        if ($oldLessonDuration !== $lesson->LessonDuration) {
            $durationDifference = $lesson->LessonDuration - $oldLessonDuration;
            $course->CourseDuration += $durationDifference;
            $course->save();
        }

        $changes = [];

        if ($oldLessonName !== $lesson->LessonName) {
            $changes['Lesson Name'] = [
                'old' => $oldLessonName,
                'new' => $lesson->LessonName,
            ];
        }

        if ($oldLessonDescription !== $lesson->LessonDescription) {
            $changes['Lesson Description'] = [
                'old' => $oldLessonDescription,
                'new' => $lesson->LessonDescription,
            ];
        }

        if ($oldLessonDuration !== $lesson->LessonDuration) {
            $changes['Lesson Duration'] = [
                'old' => $oldLessonDuration,
                'new' => $lesson->LessonDuration,
            ];
        }

        if (!empty($changes)) {
            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $lesson->course_id,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Lesson Details',
                'Changes' => $changes,
            ]);
        }

        return response()->json($lesson);
    }



  public function getLesson($lessonId)
  {
      $lesson = ZCompELearnLesson::with([
          'createdCourse',
          'createdCourse.category',
          'createdCourse.careerLevel'
      ])->find($lessonId);

      if (!$lesson) {
          return response()->json(['message' => 'Lesson not found'], 404);
      }

      $courseId = $lesson->course_id;

      return response()->json([
          'lesson' => $lesson,
          'course_id' => $courseId,
      ]);
  }

  public function uploadLessonImage(Request $request)
  {
      $request->validate([
          'file_path' => 'required|image|max:2048',
      ]);

      $path = $request->file('file_path')->store('LessonImages', 'public');

      return response()->json([
          'url' => asset('storage/' . $path),
      ]);
  }
  public function deleteLessonImage(Request $request)
  {
      $url = $request->input('url');

      $baseUrl = Storage::disk('public')->url('');
      $relativePath = str_replace($baseUrl, '', $url);

      if (Storage::disk('public')->exists($relativePath)) {
          Storage::disk('public')->delete($relativePath);
          return response()->json(['message' => 'Image deleted']);
      }

      return response()->json(['message' => 'File not found'], 404);
  }

}
