<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\CourseEnrollmentSummary;
use Illuminate\Console\Command;

class record_enrollment_statuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:record_enrollment_statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $courses = Course::with('enrollments')->chunk(100, function($courses) use(&$insertValues){
            $insertValues = [];
            foreach($courses as $course){
                $statusCount = $course->enrollments()
                            ->selectRaw('enrollment_status, COUNT(*) as count')
                            ->groupBy('enrollment_status')
                            ->pluck('count', 'enrollment_status');

                $finishedCount = $statusCount->get('finished', 0) + $statusCount->get('late-finish', 0) + $statusCount->get('failed', 0);
                $insertValues[] = [
                    'course_id' => $course->id,
                    'recorded_at' => now(),
                    'enrolled_count' => $statusCount->get('enrolled', 0),
                    'ongoing_count' => $statusCount->get('ongoing', 0),
                    'finished_count' => $finishedCount,
                    'past_due_count' => $statusCount->get('past-due', 0),
                ];
            }
            CourseEnrollmentSummary::insert($insertValues);
        });
    }
}
