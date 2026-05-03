<?php

namespace App\Http\Controllers\Api;

use App\Events\LearnerProgressUpdate;
use App\Http\Controllers\Controller;
use App\Http\Requests\TestAnswersRequest;
use App\Models\Course;
use App\Models\Test;
use App\Models\User_Test_Attempt;
use App\Models\UserInfos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    public function getResult(Test $test, TestAnswersRequest $request){
        $currentUser = $request->user()->userInfos;
        $currentUserId = $currentUser->id;
        $currentEnrollment = $test->getLatestEnrollment($currentUserId);
        $attemptCount =  User_Test_Attempt::query()
                        ->where('user_id', $currentUserId)
                        ->where('test_id', $test->id)
                        ->where('enrollment_id', $currentEnrollment->id)
                        ->whereNot('score' , null)
                        ->count();
        if($attemptCount >= $test->max_attempt){
            return response()->json([
                'message' => 'User max attempt reached'
            ],500);
        }
        $attempt = User_Test_Attempt::query()
                ->where('user_id', $currentUserId)
                ->where('test_id', $test->id)
                ->where('enrollment_id', $currentEnrollment->id)
                ->latest()
                ->first();
        if((! $attempt) || isset($attempt->score)){
            $attempt = User_Test_Attempt::create([
                    'user_id' => $currentUserId,
                    'test_id' => $test->id,
                    'enrollment_id' => $currentEnrollment->id,
                    'score' => null,
                    'is_completed' => false,
                    'started_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
            ]);
        }

        $validated = $request->validated();
        $answersIndexed = collect($validated)
                        ->mapWithKeys(fn ($item) => [$item['questionId'] => $item['answers']])
                        ->toArray();

        $QUESTIONTYPES = ["trueOrfalse", "multipleChoice" , "oneWordIdentification", "multipleWordIdentification", "likert"];
        $questions = $test->questions;
        $total = 0;
        $points = 0;
        $changePivot = [];

        foreach($questions as $question){
            $blockData = json_decode($question->BlockData, true);
            $isCorrect = false;
            $correctAns = [];
            switch($question->QuestionType){
                case $QUESTIONTYPES[0]:
                    $correctAns = array_column(array_filter($blockData['choices'], fn($row) => $row['isCorrect'] === true), 'text');
                    $isCorrect = array_map('strtolower',$answersIndexed[$question->id]) === array_map('strtolower', $correctAns);
                    break;

                case $QUESTIONTYPES[1]:
                    $correctAns = array_column(array_filter($blockData['choices'], fn($row) => $row['isCorrect'] === true), 'text');
                    $isCorrect = array_map('strtolower',$answersIndexed[$question->id]) === array_map('strtolower', $correctAns);
                    break;

                case $QUESTIONTYPES[2]:
                    $correctAns = array_column($blockData['choices'], 'text');
                    $isCorrect = array_map('strtolower',$answersIndexed[$question->id]) === array_map('strtolower', $correctAns);
                    break;

                case $QUESTIONTYPES[3]:
                    $correctAns = array_column($blockData['choices'], 'text');
                    $isCorrect = array_map('strtolower',$answersIndexed[$question->id]) === array_map('strtolower', $correctAns);
                    break;

                case $QUESTIONTYPES[4]:
                    $isCorrect = true;
                    break;
            }
            $changePivot[$question->id] = ['UserAnswer' => implode(', ', $answersIndexed[$question->id]), 'correct' => $isCorrect, ];
            if($isCorrect){
                $points += $blockData['points'];
            }
            $total += $blockData['points'];
        }
        $attempt->questions()->syncWithoutDetaching($changePivot);

        $passingGrade = $total * ($test->passing_rate/100);
        if($points < $passingGrade){
            if($currentUser->getAttemptCount($test->id) == $test->max_attempt){
                $attempt->update(['score' => $points, 'is_completed' => true, 'finished_at' => now()]);

            } else {
                $attempt->update(['score' => $points, 'is_completed' => false, 'finished_at' => now()]);
            }
            return response()->json([
                "Answers" => $points,
                "total" => $total,
                "pivot" => $changePivot,
                "passed" => false
            ]);
        }
        $attempt->update(['score' => $points, 'is_completed' => true, 'finished_at' => now()]);
        $completedModules = $currentUser->completedModules($test->course->id);
        $moduleCount = $test->course->modulesCount();
        LearnerProgressUpdate::dispatch($currentUser, $test->course, $moduleCount, $completedModules);

        return response()->json([
            "Answers" => $points,
            "total" => $total,
            "pivot" => $changePivot,
            "passed" => true
        ]);
    }

    public function getAttemptAnswers(UserInfos $user, Test $test, int $attemptNumber,){
        $attempt = $user->getAttempt($user->id, $test->id, $attemptNumber);
        $totalpoints = 0;
        $score = $attempt->score;
        $answers = $attempt->questions->map(function ($question) use(&$totalpoints,$score){
            $blockData = json_decode($question->BlockData, true);
            $QUESTIONTYPES = ["trueOrfalse", "multipleChoice" , "oneWordIdentification", "multipleWordIdentification", "likert"];
            $correctAns = [];
            switch($question->QuestionType){
                case $QUESTIONTYPES[0]:
                    $correctAns = array_column(array_filter($blockData['choices'], fn($row) => $row['isCorrect'] === true), 'text');
                    break;

                case $QUESTIONTYPES[1]:
                    $correctAns = array_column(array_filter($blockData['choices'], fn($row) => $row['isCorrect'] === true), 'text');
                    break;

                case $QUESTIONTYPES[2]:
                    $correctAns = array_column($blockData['choices'], 'text');
                    break;

                case $QUESTIONTYPES[3]:
                    $correctAns = array_column($blockData['choices'], 'text');
                    break;

                case $QUESTIONTYPES[4]:
                    break;
            }
            $totalpoints += $blockData['points'];
            $ans[$question->id] = ["UserAnswer" => $question->pivot->UserAnswer, "correct" => $question->pivot->correct, "CorrectAnswer" => $correctAns];

            return $ans;
        });

        return response()->json([
            'Score' => $score,
            'Total' => $totalpoints,
            'pivot' => $answers
        ]);
    }

    public function getTotalAttempts($userid, Test $testid){
        $enrollment = $testid->getLatestEnrollment($userid);
        $count = User_Test_Attempt::where('user_id', $userid)
                ->where('test_id', $testid->id)
                ->where('enrollment_id', $enrollment->id)
                ->whereNotNull('score')
                ->count();

        return response()->json([
            'totalAttempts' => $count,
            'maxAttempts' => $testid->max_attempt
        ]);
    }

    public function editTest ($id, Request $request){
        $test = Test::findOrFail($id);

        $validated = $request->validate([
            'passing' => 'required|integer|min:0',
            'maxAttempts' => 'required|integer|min:0',
        ]);
        $test->update([
            'passing_rate' => $validated['passing'],
            'max_attempt' => $validated['maxAttempts']
        ]);

        return response()->json([
            'message' => 'Test updated successfully',
            'data' => $test
        ], 200);
    }

    public function currentAssessmentStatus(Test $test, Request $request){
        $currentUser = $request->user()->userInfos;
        $currentUserId = $currentUser->id;
        $totalScore = 0;

        $questions = $test->questions;
        $passing = $test->passing_rate;
        foreach($questions as $question){
            $blockData = json_decode($question->BlockData, true);
            $totalScore += $blockData['points'];
        }

        $attemptCounts = User_Test_Attempt::query()
                        ->where('user_id', $currentUserId)
                        ->where('test_id', $test->id)
                        ->whereNot('score' , null)
                        ->count();

        $bestScore = User_Test_Attempt::query()
                        ->where('user_id', $currentUserId)
                        ->where('test_id', $test->id)
                        ->whereNot('score' , null)
                        ->max('score');

        $bestPercentage = $totalScore > 0 ? ($bestScore / $totalScore) * 100 : 0;

        return response()->json([
            'remark' => $bestPercentage >= $passing ? 'Passed' : 'Failed',
            'maxAttempts' => $test->max_attempt,
            'attempts' => $attemptCounts,
            'bestScore' => $bestScore,
            'bestPercentage' => round($bestPercentage, 2)
        ]);
    }

    public function getAssessmentResults($course, Request $request){
        $currentUser = $request->user()->userInfos;
        $currentUserId = $currentUser->id;

        $attempts = Course::with(['tests.attempts' => function($query) use ($currentUserId){
                        $query->where('user_id', $currentUserId);
                    }])
                    ->where('id',$course)
                    ->whereHas('tests.attempts', function($query) use ($currentUserId){
                        $query->where('user_id', $currentUserId);
                    })->first();

        $mapped = $attempts->tests->map(function ($c) {

            $totalPossibleScore = 0;
            foreach ($c->questions as $question) {
                $data = json_decode($question->BlockData, true);
                if (is_array($data) && isset($data['points'])) {
                    $totalPossibleScore += $data['points'];
                }
            }

            $userAttempts = $c->attempts;
            $bestScore = $userAttempts->max('score');
            $percentage = $totalPossibleScore > 0
            ? ($bestScore / $totalPossibleScore) * 100
            : 0;

            $status = $percentage >= $c->passing_rate ? 'Passed' : 'Failed';


            return [
                'AssessmentName' => $c->TestName,
                'MaximumScore' => $totalPossibleScore,
                'AssessmentMaxAttempts' => $c->max_attempt,
                'AssessmentUserAttempts' => $c->attempts->count(),
                'PassingRate' => $c->passing_rate,
                'Remarks' => $status
            ];
        });

        return $mapped;
    }
}
