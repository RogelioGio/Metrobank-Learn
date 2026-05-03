<?php

namespace App\Listeners;

use App\Events\AssignCourseAdmin;
use App\Models\CourseUserAssigned;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DefaultAssignedCourseAdminPerms
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
    public function handle(AssignCourseAdmin $event): void
    {
        $userids = $event->userids;
        $course = $event->course;
        $permIds = $course->course_permissions->pluck('id')->toArray();
        foreach ($userids as $userid) {
            $pivot = $course->assignedCourseAdmins()->where('user_id', $userid)->first()->pivot;
            $perm = CourseUserAssigned::find($pivot->id);
            $perm->permissions()->sync($permIds);
        }

    }
}
