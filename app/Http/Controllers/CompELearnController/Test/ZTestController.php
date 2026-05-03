<?php

namespace App\Http\Controllers\CompELearnController\Test;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ZCompELearnTest;
use App\Models\ZCompELearnCustomBlock;
use App\Models\ZCompELearnCourseVersionHistory;

class ZTestController extends Controller
{
    public function fetchCourseOfAssessment($assessmentId)
    {
        $assessment = ZCompELearnTest::with('createdCourse')->find($assessmentId);

        return response()->json($assessment->createdCourse);
    }

    public function fetchAssessmentContent($assessmentId)
    {
        $assessment = ZCompELearnTest::find($assessmentId);

        return response()->json([
        'TestName' => $assessment->TestName,
        'customBlocks' => $assessment->customBlocks,
        ]);
    }

    public function updateAssessmentDetails(Request $request, $assessmentId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $validated = $request->validate([
            'TestName' => 'nullable|string',
            'TestDescription' => 'nullable|string',
            'AssessmentDuration' => 'nullable|integer|min:1|max:360',
        ]);

        $assessment = ZCompELearnTest::findOrFail($assessmentId);

        $oldTestName = $assessment->TestName;
        $oldTestDescription = $assessment->TestDescription;
        $oldAssessmentDuration = $assessment->AssessmentDuration;

        $assessment->TestName = $validated['TestName'] ?? $assessment->TestName;
        $assessment->TestDescription = $validated['TestDescription'] ?? $assessment->TestDescription;
        $assessment->AssessmentDuration = $validated['AssessmentDuration'] ?? $assessment->AssessmentDuration;
        $assessment->save();

        $course = $assessment->createdCourse ?? null;

        if ($course && $oldAssessmentDuration !== $assessment->AssessmentDuration) {
            $durationDifference = $assessment->AssessmentDuration - $oldAssessmentDuration;
            $course->CourseDuration += $durationDifference;
            $course->save();
        }

        $changes = [];

        if ($oldTestName !== $assessment->TestName) {
            $changes['Assessment Name'] = [
                'old' => $oldTestName,
                'new' => $assessment->TestName,
            ];
        }

        if ($oldTestDescription !== $assessment->TestDescription) {
            $changes['Assessment Description'] = [
                'old' => $oldTestDescription,
                'new' => $assessment->TestDescription,
            ];
        }

        if ($oldAssessmentDuration !== $assessment->AssessmentDuration) {
            $changes['Assessment Duration'] = [
                'old' => $oldAssessmentDuration,
                'new' => $assessment->AssessmentDuration,
            ];
        }

        if (!empty($changes)) {
            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $assessment->course_id,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Assessment Details',
                'Changes' => $changes,
            ]);
        }

        return response()->json([
            'message' => 'Assessment updated successfully',
            'assessment' => $assessment,
        ]);
    }

    public function updateQuestionBlocks(Request $request, $assessmentId, $courseId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        $request->validate([
            'assessmentItem' => 'required|array|min:1',
            'assessmentItem.*.questionType' => 'required|string',
            'assessmentItem.*.question' => 'required|string',
            'assessmentItem.*.choices' => 'required|array|min:1',
            'assessmentItem.*.points' => 'required|integer|min:0',
        ]);

        $assessment = ZCompELearnTest::findOrFail($assessmentId);

        $oldBlocks = $assessment->customBlocks()->get()->map(function ($block) {
            return [
                'QuestionType' => $block->QuestionType,
                'BlockData' => $block->BlockData,
            ];
        })->toArray();

        $assessment->customBlocks()->where('AssessmentID', $assessmentId)->delete();

        $newBlocks = [];
        foreach ($request->input('assessmentItem') as $question) {
            $blockData = [
                'question' => $question['question'],
                'choices' => $question['choices'],
                'points' => $question['points'],
            ];

            $assessment->customBlocks()->create([
                'AssessmentID' => $assessmentId,
                'QuestionType' => $question['questionType'],
                'BlockData' => $blockData,
            ]);

            $newBlocks[] = [
                'QuestionType' => $question['questionType'],
                'BlockData' => $blockData,
            ];
        }

        if ($oldBlocks !== $newBlocks) {
            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $courseId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Updated Assessment Questions',
                'Changes' => [
                    'Assessment Content' => [
                        'old' => $oldBlocks,
                        'new' => $newBlocks,
                    ],
                    'AssessmentName' => [
                        'old' => null,
                        'new' => $assessment->TestName,
                    ],
                ],
            ]);
        }

        return response()->json(['message' => 'Questions updated successfully'], 200);
    }

    public function fetchAssessment($id) {
        $assessment = ZCompELearnTest::with('customBlocks', 'createdCourse', 'createdCourse.category', 'createdCourse.careerLevel')->find($id);

        return response()->json($assessment);
    }


public function handleAssessmentItem(Request $request, $id, $courseId)
{
    // Log the full incoming request
    \Log::info('Incoming assessment item request', [
        'course_id' => $courseId,
        'assessment_id' => $id,
        'payload' => $request->all()
    ]);

    $question = $request->validate([
        'assessmentItem' => 'required|array|min:1',
        'assessmentItem.*.id' => 'nullable|integer',
        'assessmentItem.*.questionType' => 'required|string',
        'assessmentItem.*.question' => 'required|string',
        'assessmentItem.*.choices' => 'required|array|min:1',
        'assessmentItem.*.points' => 'required|integer|min:0',
    ]);

    foreach ($question['assessmentItem'] as $item) {
        $dataToSave = [
            'AssessmentID' => $id,
            'QuestionType' => $item['questionType'],
            'BlockData' => [
                'question' => $item['question'],
                'choices' => $item['choices'],
                'points' => $item['points'],
            ],
        ];

        \Log::info('Saving assessment item', [
            'lookup_id' => $item['id'] ?? null,
            'data' => $dataToSave
        ]);

        ZCompELearnCustomBlock::updateOrCreate(
            ['id' => $item['id']],
            $dataToSave
        );
    }

    \Log::info('All assessment items processed successfully.');

    return response()->json(['message' => 'The question saved successfully']);
}

}
