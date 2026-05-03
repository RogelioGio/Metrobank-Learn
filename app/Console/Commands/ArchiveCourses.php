<?php

namespace App\Console\Commands;

use App\Models\AssignedCourseAdminNotify;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ArchiveCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:archive-courses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Courses that will archive will be archived';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $distinctScheduleMaintenance = AssignedCourseAdminNotify::with('course')->distinct('course_id')->get();

        $courseIds = [];

        foreach($distinctScheduleMaintenance as $single){
            if(Carbon::parse($single->WillArchiveAt) <= now()){
                if($single->course->status === "for_archival"){
                    $single->course->update(['status' => 'archived']);
                    $courseIds[] = $single->course->id;    
                }
                
            }
        }

        AssignedCourseAdminNotify::whereHas('course', fn($q) => $q->whereIn('id', $courseIds))->delete();
    }
}
