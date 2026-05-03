<?php

namespace App\Listeners;

use App\Events\UpdateCourseStatusReviewed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateCourseStatusToReviewed
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
    public function handle(UpdateCourseStatusReviewed $event): void
    {
        $course = $event->course;
        $course->CourseStatus = 'reviewed';
        $course->save();
    }
}
