<?php

namespace App\Listeners;

use App\Events\CourseCompleted;
use App\Models\certificate_userinfo;
use App\Notifications\GiveUserCertificate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class GiveLearnerCertificate
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
    public function handle(CourseCompleted $event): void
    {
        $learnerId = $event->user->id;
        $certificateId = $event->course->certificate->id;
        $givenCert = certificate_userinfo::where('user_id', $learnerId)->where('certificate_id', $certificateId)->first();
        
        if(!$givenCert){
            certificate_userinfo::create([
                'user_id' => $learnerId,
                'certificate_id' => $certificateId,
                'date_finished' => now(),
            ]);
        }
        $usernotif = $event->user->userCredentials;
        // $usernotif->notify(new GiveUserCertificate($event->course));
    }
}
