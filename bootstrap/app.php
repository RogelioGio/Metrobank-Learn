<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
// use Spatie\Permission\Middleware\PermissionMiddleware;
// use Spatie\Permission\Middleware\RoleMiddleware;
// use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

use App\Http\Middleware\CheckCoursePermission;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // For Laravel Spatie
        $middleware->alias([
            // 'permission' => PermissionMiddleware::class,
            // 'role' => RoleMiddleware::class,
            // 'role_or_permission' => RoleOrPermissionMiddleware::class,
            'course_permission' => CheckCoursePermission::class,
        ]);

        //  
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
