<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendDistributorNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $distributor;
    protected $notificationData;

    public function __construct($distributor, $notificationData)
    {
        $this->distributor = $distributor;
        $this->notificationData = $notificationData;
    }

    public function handle()
    {
        $this->distributor->userCredentials?->notify(new \App\Notifications\ZConnectDistributeCourseNotification($this->notificationData));
    }
}
