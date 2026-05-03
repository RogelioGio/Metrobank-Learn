<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('app:check-enrollment-deadlines')
    ->timezone('Asia/Hong_Kong')
    ->daily();

Schedule::command('app:archive-courses')
    ->timezone('Asia/Hong_Kong')
    ->daily();

Schedule::command('app:z-connect-delete-expired-courses')
    ->timezone('Asia/Hong_Kong')
    ->daily();

Schedule::command('app:record_enrollment_statuses')
    ->timezone('Asia/Hong_Kong')
    ->daily();

Schedule::call(function () {
    Log::info('Deleted Courses schedule executed successfully!');
})->daily();
