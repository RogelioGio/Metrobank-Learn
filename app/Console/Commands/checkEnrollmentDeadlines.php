<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Notifications\CourseDueSoonNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class checkEnrollmentDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-enrollment-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks enrollment deadlines';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $enrollment = Enrollment::with('enrolledUser.userCredentials')->get();
        foreach($enrollment as $enroll){
            $end = Carbon::parse($enroll->end_date);
            $in3days = Carbon::now()->addDays(3);
            if($enroll->enrollment_status === "finished" || $enroll->enrollment_status === "failed" || $enroll->enrollment_status === "late_finish"){
                continue;
            }
            if($end->addDay()->lessThanOrEqualTo(now())){
                $enroll->update(['enrollment_status' => 'past-due']);
                continue;
            }

            if($end->lessThanOrEqualTo($in3days)){
                $enroll->update(['due_soon' => true]);
                $enroll->update(['enrollment_status' => "due_soon"]);
                $enrolledUserCreds = $enroll->enrolledUser->userCredentials;
                $enrolledUserCreds->notify(new CourseDueSoonNotification($enroll));
            }
        }
        Log::info('Check enrollment deadlines ran successfully');
    }
}
