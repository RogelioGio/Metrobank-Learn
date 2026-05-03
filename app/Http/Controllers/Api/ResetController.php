<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\certificate_userinfo;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Learner_Progress;
use App\Models\User_Test_Attempt;
use App\Models\UserInfos;
use Illuminate\Http\Request;

class ResetController extends Controller
{
    // FOR SYMPOSIUM NOT FOR ACTUAL USE
    public function resetLearner(UserInfos $user, Course $course){
        $certificate = $course->certificate;
        $enrollment = Enrollment::with('tests')->where('user_id', $user->id)->where('course_id', $course->id)->first();
        if(!$enrollment){
            return "There's no enrollment for user with course";
        }
        certificate_userinfo::where('user_id', $user->id)->where('certificate_id', $certificate->id)->forceDelete();
        Learner_Progress::where('enrollment_id', $enrollment->id)->update(['is_completed' => false]);
        User_Test_Attempt::where('enrollment_id', $enrollment->id)->update(['is_completed' => false, 'score' => null]);
        $enrollment->update(['enrollment_status' => 'enrolled']);
        $testIds = $course->tests()->pluck('id');
        foreach($testIds as $id){
            $keepAttempt = User_Test_Attempt::where('enrollment_id', $enrollment->id)->where('test_id', $id)->first();
            User_Test_Attempt::where('enrollment_id', $enrollment->id)->where('test_id', '!=', $id)->delete();
            $keepAttempt->questions()->updateExistingPivot($keepAttempt->questions()->pluck('question_id'), ['UserAnswer' =>false, 'correct' => false]);
        }


        return "User and Course relation reset";
    }
}
