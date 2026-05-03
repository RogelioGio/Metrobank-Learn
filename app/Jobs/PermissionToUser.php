<?php

namespace App\Jobs;

use App\Models\UserInfos;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PermissionToUser implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public UserInfos $user, public array $permissions)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Gumagana naman', ["permissions" => $this->permissions]);
        $user = $this->user;
        if(!$user) return;

        $permissions = array_column($this->permissions, 'id');
        $user->permissions()->sync($permissions);
    }
}
