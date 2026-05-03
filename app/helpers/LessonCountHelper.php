<?php

namespace App\helpers;

use Carbon\Carbon;

class LessonCountHelper{
    public static function getEnrollmentStatusCount($courses){
        foreach($courses as $course){
            $enrollments = $course->enrollments;
            $enrolled = 0;
            $ongoing = 0;
            $due_soon = 0;
            $past_due = 0;
            foreach($enrollments as $enrollment){
                $deadline = Carbon::parse($enrollment->end_date);

                if (!$enrollment->enrolledUser || $enrollment->enrolledUser->status !== 'Active') {
                    continue;
                }

                if ($enrollment->enrollment_status === 'finished') {
                    continue;
                }

                if(!$deadline->isPast()){
                    if($enrollment->enrollment_status == 'enrolled'){
                        $enrolled++;
                    } elseif($enrollment->enrollment_status == 'ongoing'){
                        $ongoing++;
                    }
                    if($enrollment->due_soon){
                        $due_soon++;
                    }
                } else if($enrollment->allow_late == true){
                    switch($enrollment->enrollment_status){
                        case 'enrolled':
                            $enrolled++;
                            break;
                        case 'ongoing':
                            $ongoing++;
                            break;
                    }
                } else {
                    $past_due++;
                }
            }
            $course->enrolled = $enrolled;
            $course->ongoing = $ongoing;
            $course->due_soon = $due_soon;
            $course->past_due = $past_due;
        }
        return $courses;
    }
}

