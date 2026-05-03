<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnDeletedCoursesRetention;
use Carbon\Carbon;

class ZConnectDeleteExpiredCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:z-connect-delete-expired-courses';

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
        $now = Carbon::now();
        $deletedCourseCount = 0;

        $courses = ZCompELearnCreatedCourse::where('CourseStatus', 'deleted')
            ->whereNotNull('DeletedAt')
            ->get();

        foreach ($courses as $course) {
            $retentionSettings = ZCompELearnDeletedCoursesRetention::where('user_info_id', $course->user_info_id)->first();

            $retentionValue = $retentionSettings->RetentionValue ?? 30;
            $retentionUnit = $retentionSettings->RetentionUnit ?? 'days';

            $settingsUpdatedAt = Carbon::parse($course->SettingsUpdatedAt);

            $expiryDate = match ($retentionUnit) {
                'weeks' => $settingsUpdatedAt->copy()->addWeeks($retentionValue),
                'months' => $settingsUpdatedAt->copy()->addMonths($retentionValue),
                default => $settingsUpdatedAt->copy()->addDays($retentionValue),
            };

            if ($now->gte($expiryDate)) {
                $course->forceDelete();
                $deletedCourseCount++;
            }
        }

        $this->info("Deleted {$deletedCourseCount} expired deleted courses.");
    }
}
