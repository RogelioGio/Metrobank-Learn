<?php

namespace App\Jobs;

use App\Models\UserInfos;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PermissionToUserSingle implements ShouldQueue
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
        $user = $this->user;
        if(!$user) return;

        $permissions = array_column($this->permissions, 'permission_Id');
        $user->permissions()->sync($permissions);
    }
}
