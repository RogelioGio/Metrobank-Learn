<?php

namespace App\Http\Controllers;

use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoginStatsController extends Controller
{
    //logs the user login daily,
    public function dailies() {
        $login = UserLogin::select(
            DB::raw('login_date as "date"'),
            DB::raw('COUNT(user_id) as "logins"')
        )->groupBy('login_date')
        ->orderBy('login_date', 'DESC')
        ->get();

        return response()->json($login);
    }
}
