<?php

namespace App\Listeners;

use App\Events\ReviewerResponded;
use App\Events\UpdateCourseStatusReviewed;
use App\Models\ZCompELearnCourseViewer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CheckIfAllResponded
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
    public function handle(ReviewerResponded $event): void
    {
        $course = $event->course;

        //Pending
        $pending = ZCompELearnCourseViewer::where('course_id', $course->id)
                                            ->where('approval_status', 'pending')
                                            ->exists();

        if(!$pending){
            UpdateCourseStatusReviewed::dispatch($course);
        }


        //
    }
}
