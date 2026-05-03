<?php

namespace App\Http\Controllers\CompELearnController\UserReports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserInfos;
use App\Models\ZCompELearnUserReports;
use Barryvdh\DomPDF\Facade\Pdf;

class ZUserReportsController extends Controller
{
    public function fetchUserReports(Request $request, $userInfoId)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);

        $logsQuery = ZCompELearnUserReports::where('user_info_id', $userInfoId);

        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $logsQuery->where(function ($query) use ($search) {
                $query->whereRaw('LOWER("Action") LIKE ?', ["%{$search}%"])
                    ->orWhereRaw("LOWER(\"Details\"->>'Course Name') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("LOWER(\"Details\"->>'Reason') LIKE ?", ["%{$search}%"]);
            });
        }

        if ($request->filled('actionType')) {
            $actionType = strtolower($request->input('actionType'));
            $logsQuery->whereRaw('LOWER("Action") LIKE ?', ["%{$actionType}%"]);
        }

        $logs = $logsQuery
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json($logs);
    }

    public function downloadUserReport(Request $request, $userInfoId)
    {
        $user = UserInfos::findOrFail($userInfoId);

        \Log::info($user);

        $logsQuery = ZCompELearnUserReports::where('user_info_id', $userInfoId);

        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $logsQuery->where(function ($query) use ($search) {
                $query->whereRaw('LOWER("Action") LIKE ?', ["%{$search}%"])
                    ->orWhereRaw("LOWER(\"Details\"->>'Course Name') LIKE ?", ["%{$search}%"])
                    ->orWhereRaw("LOWER(\"Details\"->>'Reason') LIKE ?", ["%{$search}%"]);
            });
        }

        if ($request->filled('actionType')) {
            $actionType = strtolower($request->input('actionType'));
            $logsQuery->whereRaw('LOWER("Action") LIKE ?', ["%{$actionType}%"]);
        }

        if ($request->filled('fromDate')) {
            $fromDate = $request->input('fromDate');
            if (strtotime($fromDate)) {
                $logsQuery->whereDate('created_at', '>=', $fromDate);
            }
        }

        if ($request->filled('toDate')) {
            $toDate = $request->input('toDate');
            if (strtotime($toDate)) {
                $nextDay = date('Y-m-d', strtotime($toDate . ' +1 day'));
                $logsQuery->where('created_at', '<', $nextDay);
            }
        }

        $logs = $logsQuery->orderBy('created_at', 'desc')->get();

        $pdf = Pdf::loadView('Zreports.userReports', [
            'user' => $user,
            'actions' => $logs
        ]);

        $fullName = trim("{$user->first_name} {$user->middle_name} {$user->last_name}");
        $fullName = preg_replace('/\s+/', '-', $fullName);

        return $pdf->download("user-report-{$fullName}.pdf");
    }
}