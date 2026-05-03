<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Activitylogs;

class ActivityLogsController extends Controller
{
    public function index()
    {
        $activityLogs = Activitylogs::query()->orderBy('created_at', 'desc')->get();
        return response()->json($activityLogs);
    }
}
