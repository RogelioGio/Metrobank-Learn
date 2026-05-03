<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseAssessmentStatsController extends Controller
{
    public function perCourseAssessment(Course $course){
        $assessments = $course->tests;

        $testsStats = $assessments->map(function($test){
                $uniqueAttempts = $test->attempts()
                    ->with('user', 'questions')
                    ->where('is_completed', true)
                    ->selectRaw('DISTINCT ON (user_id) *')
                    ->orderBy('user_id')
                    ->orderByDesc('score')
                    ->get();
                
                $attemptCount = $test->attempts()
                ->where('is_completed', true)
                ->select('user_id', DB::raw('COUNT(*) as total_attempts'))
                ->groupBy('user_id')
                ->get();

                $totalAttempts = 0;
                $averageAttempts = $attemptCount->map(function($single) use(&$totalAttempts){
                    $totalAttempts += $single->total_attempts;
                });
                $averageAttempts = $totalAttempts / $attemptCount->count();

                $uniqueAttempts->map(function($attempt) use($attemptCount, $test){
                    if($attempt->score > $test->passingScore()){
                        $attempt->remarks = 'passed';
                    } else{
                        $attempt->remarks = 'failed';
                    }
                    $attempt->total_attempts = optional($attemptCount->firstWhere('user_id', $attempt->user_id))->total_attempts ?? 0;
                });
                $test->average_attempts = $averageAttempts;
                $test->unique_attempts = $uniqueAttempts;
                return $test;
        });
        
        $questionsStats = $assessments->map(function($test){
            $questions = $test->questions;

            $questions->map(function($question){
                $attempts = $question->attempts()->wherePivotNotNull('UserAnswer')->get();
                $totalAttempts = $attempts->count();
                if ($totalAttempts === 0) {
                    $question->answers_stats = collect();
                    $question->correct_stats = collect(['incorrect' => 0, 'correct' => 0]);
                    return $question;
                }
                $answersGroup = $attempts->groupBy('pivot.UserAnswer')->map->count();
                $answersStats = $answersGroup->map(function($stat) use($totalAttempts){
                    return round(($stat / $totalAttempts) * 100, 2);
                });

                $correctGroup = $attempts->groupBy('pivot.correct')->map->count();
                $correctStats = $correctGroup->map(function($stat) use ($totalAttempts){
                    return round(($stat / $totalAttempts) * 100, 2);
                });
                $correctStats = collect([
                    'incorrect' => $correctStats->get(0,0),
                    'correct' => $correctStats->get(1,0),
                ]);
                
                $question->answers_stats = $answersStats;
                $question->correct_stats = $correctStats;

                return $question;
            });
            return $questions;
        });

        return response()->json([
            'TestStats' => $testsStats,
            'QuestionStats' => $questionsStats,
        ]);
    }
}
