<?php

namespace App\Http\Controllers\CompELearnController\Course;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ZCompELearnCourse;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnLesson;
use App\Models\ZCompELearnTest;
use App\Models\ZCompELearnAttachment;

class ZCourseController extends Controller
{
  public function index()
  {
    $courses = ZCompELearnCourse::select(
      'id',
      'CourseName',
      'CategoryName',
      'ImagePath',
      )->get();

    return response()->json($courses);
  }

  public function show($id)
  {
    $course = ZcompELearnCourse::find($id);

    return response()->json($course);
  }

    public function updateModuleName(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'type' => 'required|string|in:module,assessment,file,video',
            'title' => 'required|string|max:255',
        ]);

        if ($validated['type'] === 'module') {
            $module = ZCompELearnLesson::find($validated['id']);
            if (!$module) {
                return response()->json(['message' => 'Module not found'], 404);
            }
            $module->LessonName = $validated['title'];
            $module->save();
        } elseif ($validated['type'] === 'assessment') {
            $assessment = ZCompELearnTest::find($validated['id']);
            if (!$assessment) {
                return response()->json(['message' => 'Assessment not found'], 404);
            }
            $assessment->TestName = $validated['title'];
            $assessment->save();
        }

        return response()->json(['message' => 'Module name updated successfully']);
    }

    public function showSoftCopy($courseId)
    {
        $course = ZCompELearnCreatedCourse::with([
            'careerLevel', 
            'category', 
            'userInfo',
            'lessons',
            'tests.customBlocks',
            'certificates'
        ])->findOrFail($courseId);

        \Log::info($course);
        
        return view('certificate.courseTemplate', compact('course'));
    }
}
