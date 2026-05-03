<?php

namespace App\Listeners;

use App\Events\CourseCompleted;
use App\Events\EnrollmentStatusBroadcasted;
use App\Events\LearnerProgressUpdate;
use App\Notifications\CourseCompletion;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEnrollmentStatus implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(LearnerProgressUpdate $event): void
    {
        // $course = $event->lesson->course;
        // $enrollment = $event->userInfos->enrollments()->where('course_id', $course->id)->first();
        // $lesson_count = $course->lessons()->count();
        // $completed_count = $event->userInfos->lessons()->where('course_id', $course->id)
        //     ->wherePivot('is_completed', true)->count();
        // if($lesson_count > $completed_count){
        //     $enrollment->update(['enrollment_status' => 'ongoing']);
        // } elseif($lesson_count == $completed_count){
        //     $enrollment->update(['enrollment_status' => 'finished']);
        // }

        $learner = $event->user;
        $course = $event->course;

        $enrollment = $learner->enrollments()->where('course_id', $course->id)->latest()->first();

        // $totalModules = $course->modulesCount();
        // $completedModules = $learner->completedModules($course->id);


        if($event->completedModules >= 1){
            $enrollment->update(['enrollment_status' => 'ongoing']);
        }

        if($event->completedModules == $event->modulesCount){
            if($learner->passedTestCount($course) != $course->tests()->count()){
                $enrollment->update(['enrollment_status' => 'failed']);
            } else{
                if($enrollment->end_date <now()){
                    $enrollment->update(['enrollment_status' => 'late_finish']);

                }
                $enrollment->update(['enrollment_status' => 'finished']);
                CourseCompleted::dispatch($learner, $course);
            }
            // broadcast(new EnrollmentStatusBroadcasted($event->user->userCredentials->id));
            $learner->userCredentials->notify(new CourseCompletion($learner->id));
        }
    }
}
