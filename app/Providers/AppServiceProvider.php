<?php

namespace App\Providers;

use App\Listeners\TrackFailedLogins;
use App\Models\UserInfos;
use App\Policies\userInfosPolicy;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(Failed::class, [TrackFailedLogins::class, 'handle']);
        Gate::policy(UserInfos::class, userInfosPolicy::class);
        JsonResource::withoutWrapping();
    }
}
