<?php

namespace App\Listeners;

use App\Events\BulkUserAddedEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LogBulkAddUsers
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
    public function handle(BulkUserAddedEvent $event): void
    {
        Log::info('BulkAddUsers event broadcasted.', [
            'summary' => $event->summary
        ]);
    }
}
