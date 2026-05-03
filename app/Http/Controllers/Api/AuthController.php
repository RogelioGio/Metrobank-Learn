<?php

namespace App\Http\Controllers\Api;

use App\Events\UserLoggedInElsewhere;
use App\Http\Controllers\Controller;
use App\Http\Controllers\MailComponent;
use App\Http\Requests\LoginRequest;
use App\Models\UserCredentials;
use App\Models\UserLogin;
use App\Models\UserOtp;
use App\Services\UserLogService;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\SendOTP;
use App\Services\PhilSMSService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    //role dashboard redirections
    private function redirections(array $roles){
        foreach($roles as $role){
            if(in_array('System Admin', $role)){
                return '/systemadmin';
            } elseif(in_array('Course Admin', $role)){
                return '/courseadmin';
            } elseif(in_array('Learner', $role)){
                return '/learner';
            } elseif(in_array('SME', $role))    {
                return '/SME';
            }
        }
    }

    // private function redirection($roles){
    //     if($roles === 'System Admin'){
    //         return '/systemadmin';
    //     } elseif($roles === 'Course Admin'){
    //         return '/courseadmin';
    //     } elseif($roles === 'Learner'){
    //         return '/learner';
    //     } else{
    //         return '/';
    //     }
    // }

    //New Login to another table
    public function login(LoginRequest $request, MailComponent $mailComponent){

        $credentials = $request->validated();
        $key = 'login-attempts:'. Str::lower($credentials['MBemail']);
        $user = UserCredentials::with(['userInfos.roles'])->where('MBemail', strtolower($credentials['MBemail']))->orWhereHas('userInfos', function ($query) use ($credentials) {
            $query->where('employeeID', $credentials['MBemail']);
        }) ->first();
        $remaining = RateLimiter::remaining($key, 5);

        //OTP generation and verification
        $otp = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        if(!$user){
            return response()->json([
                'message' => 'There is no user with that credentials',
            ], 401);
        }

        // $htmlBody = view('emails.otp_template', [
        //     'otp' => $otp,
        //     'user' => $user->userInfos->first_name,
        // ])->render();

        if(!($user->userInfos->status === "Active")){
            return response()->json([
                'message' => 'This user is currently inactive'
            ], 401);
        }

        if($user){
            $credentials = [
                'MBemail' => strtolower($user->MBemail),
                'password' => $credentials['password'],
            ];
            if(Auth::attempt($credentials)){
                RateLimiter::clear($key);
                Log::info('User Login: ' . $user->userInfos->MBemail);
                //$token = $user->createToken('authToken')->plainTextToken;
                // $redirect = $this->redirection($user->role);

                $recipient = '';
                $role = $user->userInfos->roles->first()->role_name ?? null;

                // switch ($role) {
                //     case 'System Admin':
                //         $recipient = 'Jennifer.Revamonte@outlook.com';
                //         break;
                //     case 'Course Admin':
                //         $recipient = 'serena.villegas@outlook.com';
                //         break;
                //     case 'Learner':
                //         $recipient = 'James.Raymonte@outlook.com';
                //         break;
                //     case 'SME-Creator':
                //         $recipient = 'adriana.alon@outlook.com';
                //         break;
                //     case 'SME-Viewer':
                //         $recipient = 'elena.mabini@outlook.com';
                //         break;
                //     case 'SME-Distributor':
                //         $recipient = 'orlando.bayani@outlook.com';
                //         break;
                //     default:
                //         $recipient = env('MB_EMAIL');
                //         break;
                // }
                // $recipient = $user->MBemail;

                //Email OTP to user
                // $result = $mailComponent->sendOutlook(
                //     $recipient,
                //     "MBLearn Account Verification-".$user->userInfos->first_name,
                //     $htmlBody
                // );
                $user->notify(new SendOTP($otp, $user->userInfos->first_name));

                UserOtp::updateOrCreate(
                    ['user_creds_id' => $user->id],
                    ['otp' => Hash::make($otp), 'expires_at' => $expiresAt]
                );

                return response()->json([
                    'message' => 'Login Successful',
                    'user' => $user->makeVisible('phone_number'),
                    // 'OTPsent' => $result,
                ], 200);
            };
        }

        if(RateLimiter::tooManyAttempts($key, 5)){
            $secondsUntilUnlocked = RateLimiter::availableIn($key);
            $minutes = ceil($secondsUntilUnlocked/60);
            return response()->json([
                'message' => "Maximum number of attempts tried, please try again in ". $minutes." minutes",
            ],401);
        }

        RateLimiter::hit($key,60*5);
        return response()->json([
            'message' => 'Invalid password, you have '. $remaining.' tries remaining',
        ], 401);
    }

    public function verifyOtp(Request $request, UserLogService $userLogService){

        $request->validate([
            'user_id' => 'required|exists:userCredentials,id',
            'otp' => 'required|digits:6',
            'user_email' => 'required|email',
        ]);

        //$user_info = UserCredentials::where('MBemail', $request->input("user_email"))->first();
        $user_id = $request->input('user_id');
        $input_otp = $request->input('otp');

        $user = UserCredentials::findOrFail($user_id);
        $userOtp = UserOtp::where('user_creds_id', $user->id)->where('expires_at','>',now())->first();

        //If OTP expire
        if(!$userOtp){
            return response()->json(['message' => 'OTP has expired or does not exist'], 400);
        }

        //Verify OTP
        if(!Hash::check($input_otp, $userOtp->otp)){
            return response() -> json([
                'message' => 'OTP is not matched',
            ],401);
        }else{
            $fullName = trim($user->userInfos->first_name . ' ' . ($user->userInfos->middle_name ?? '') . ' ' . $user->userInfos->last_name);
            $userLogService->log(
                $user->userInfos->id,
                'login',
                $fullName . " has successfully login" ,
                $request->ip()
            );

            $user->update(['timeout_count' => 0, 'last_logged_in' => now('Asia/Hong_Kong')->toDateTimeString()]);

            //Restritct to one session only
            $hadActiveTokens = $user->tokens()->count() > 0;
            $user->tokens()->delete();
            UserLoggedInElsewhere::dispatch($user->id);
            if ($hadActiveTokens) {
                UserLoggedInElsewhere::dispatch($user->id);
            }
            $refreshToken = Str::random(64);

            //$accessToken = $user->createToken('authToken')->plainTextToken;
            $token = $user->createToken('authToken');
            $accessToken = $token->plainTextToken;
            $tokenModel = $token->accessToken;

            $tokenModel->refresh_token = hash('sha256', $refreshToken);
            $tokenModel->ip_address    = $request->ip();
            $tokenModel->user_agent    = $request->userAgent() ?? 'web';
            $tokenModel->device_name   = 'web';
            $tokenModel->expires_at    = now()->addMinutes(15);
            $tokenModel->refresh_expires_at = now()->addDays(7);
            $tokenModel->save();

            $redirect = $this->redirections($user->userInfos->roles->toArray());

            UserLogin::firstOrCreate([
                'user_id' => $user->userInfos->id,
                'login_date' => now()->toDateString(),
            ]);
        };

        $userOtp -> delete();

        return response() ->json([
            'message' => 'otp works',
            'token'  => $accessToken,
            'token_type'    => 'Bearer',
            'expires_in'    => 15, // 15 minutes
            'refresh_token' => $refreshToken,
            'tokenModel' => $tokenModel,
            'redirect' => $redirect,
            'first_login' => $user->first_log_in,
        ]);

    }

    public function requestOTP(Request $request, MailComponent $mailComponent){

        $request -> validate([
            'user_id' => 'required|exists:userCredentials,id'
        ]);

        $otp = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        $user = UserCredentials::findOrFail($request->input('user_id'));

        UserOtp::updateOrCreate(
            ['user_creds_id' => $user->id],
            ['otp' => Hash::make($otp), 'expires_at' => $expiresAt]
        );

        $user->notify(new SendOTP($otp, $user->userInfos->first_name));
        return response() -> json([
            'message' => 'OTP Requested'
        ],200);
    }

    public function requestOTPSMS(Request $request, PhilSMSService $sms){
        $request -> validate([
            'user_id' => 'required|exists:userCredentials,id',
        ]);

        $otp = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        $user = UserCredentials::findOrFail($request->input('user_id'));

        UserOtp::updateOrCreate(
            ['user_creds_id' => $user->id],
            ['otp' => Hash::make($otp), 'expires_at' => $expiresAt]
        );


        // $message = `Your verification code is {$otp}. Enter this code in the app to verify your account. Do not share this code with anyone.`;
        $message = "We received a request to log in to your MBLearn account. To complete your login, please use the One-Time Password (OTP) provided below: Account Current One Time Password: ".$otp;

        $sent = $sms->send( $user->phone_number, $message);
        return response() -> json([
            'message' => 'OTP Sent'
        ],200);
    }

    public function requestOTPEmailResetPassword(Request $request, UserLogService $userLogService){
        $request->validate([
            'MBemail' => 'required',
        ]);

        $otp = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        $user = UserCredentials::with(['userInfos'])->where('MBemail', $request['MBemail'])->orWhereHas('userInfos', function ($query) use ($request) {
            $query->where('employeeID', $request['MBemail']);
        })
        ->first();
        if(!$user){
            return response()->json([
                'message' => 'User not found'
            ]);
        }
        if(!($user->userInfos->status === "Active")){
            return response()->json([
                'message' => 'This user is currently inactive'
            ], 401);
        }
        UserOtp::updateOrCreate(
            ['user_creds_id' => $user->id],
            ['otp' => Hash::make($otp), 'expires_at' => $expiresAt]
        );

        $userinfos = $user->userInfos;
        $userLogService->log(
                $user->userInfos->id,
                'login',
                $userinfos->fullName() . " has reset their own password" ,
                $request->ip()
        );

        $user->notify(new SendOTP($otp, $user->userInfos->first_name));

        return response()->json([
            'message' => 'OTP sent',
            'User' => $user,
        ]);
    }

    public function verifyOTPResetPassword(Request $request, UserLogService $userLogService){
        $request->validate([
            'user_id' => 'required|exists:userCredentials,id',
            'otp' => 'required|digits:6',
            'user_email' => 'required|email', 
        ]);

        $user_id = $request->input('user_id');
        $input_otp = $request->input('otp');

        $user = UserCredentials::findOrFail($user_id);
        $userOtp = UserOtp::where('user_creds_id', $user->id)->where('expires_at','>',now())->first();

        //If OTP expire
        if(!$userOtp){
            return response()->json(['message' => 'OTP has expired or does not exist'], 400);
        }

        //Verify OTP
        if(!Hash::check($input_otp, $userOtp->otp)){
            return response() -> json([
                'message' => 'OTP is not matched',
            ],401);
        }else{
            $userinfos = $user->userInfos;
            $password = preg_replace('/\s+/', '', $userinfos->first_name."_".$userinfos->employeeID);
            $user->update(['password' => $password, 'first_log_in' => true]);
            $userLogService->log(
                $user->userInfos->id,
                'login',
                $userinfos->fullName() . " has reset their own password" ,
                $request->ip()
            );
        }

        return response()->json([
            'message' => 'User password reset',
        ]);
    }

    public function validatePhoneNumber(Request $request, PhilSMSService $sms){
        $request->validate([
            'phone' => 'required|string'
        ]);
        $user = $request->user();

        $otp = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+20 minutes'));
        UserOtp::updateOrCreate(
                ['user_creds_id' => $user->id],
                ['otp' => Hash::make($otp), 'expires_at' => $expiresAt]
            );

        //$message = `Your verification code is {$otp}. Enter this code in the app to verify your account. Do not share this code with anyone.`;
        $message = "We received a request to log in to your MBLearn account. To complete your login, please use the One-Time Password (OTP) provided below: Account Current One Time Password: ".$otp;

        $sent = $sms->send($request['phone'], $message);
        return response()->json([
            'sent' => $sent,
            'message' => 'OTP Sent',
        ]);
    }

    public function SavePhoneNumber(Request $request){
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
        ]);
        $user = $request->user();
        $userOtp = UserOtp::where('user_creds_id', $user->id)->where('expires_at','>',now())->first();

        if(!$userOtp){
            return response()->json(['message' => 'OTP has expired or does not exist'], 400);
        }

        //Verify OTP
        if(!Hash::check($request['otp'], $userOtp->otp)){
            return response() -> json([
                'message' => 'OTP is not matched',
            ],401);
        } else{
            $user->update(['phone_number' => $request['phone']]);

            return response()->json([
                'message' => 'Phone number saved'
            ]);
        }
    }

    public function logout(Request $request,UserLogService $userLogService){
        if ($user = $request->user()) {
            $user->currentAccessToken()->delete();
            $fullName = trim($user->userInfos->first_name . ' ' . ($user->userInfos->middle_name ?? '') . ' ' . $user->userInfos->last_name);
            $userLogService->log(
                $user->userInfos->id,
                'logout',
                $fullName . " has successfully logout" ,
                $request->ip()
            );

            return response()->json(['message' => 'Logged out successfully'], 200);
        }

        return response()->json(['message' => 'No user to logout'], 400);
    }

    //Request to reset password
    public function reqResetPassword(Request $request, MailComponent $mailComponent){

        $request->validate([
            'email' => 'required|email|exists:userCredentials,MBemail',
        ]);
        $email = $request->input('email');

        $user = UserCredentials::where('MBemail', $email)->with(['userInfos.division', 'userInfos.section','userInfos.department','userInfos.city','userInfos.branch','userInfos.roles'])->first();

        $fullname = trim($user->userInfos->first_name . ' ' . ($user->userInfos->middle_name ? $user->userInfos->middle_name . ' ' : '') . $user->userInfos->last_name . ' ' . ($user->userInfos->suffix ? $user->userInfos->suffix : ''));

        $htmlBody = view('emails.reset_password_notification',[
            'user_fullName' => $fullname,
            'user_MBEmail' => $user->MBemail,
            'employeeID' => $user->userInfos->employeeID,
            'division' => $user->userInfos->division ? $user->userInfos->division->division_name : "No Division Assigned",
            'department' => $user->userInfos->department ? $user->userInfos->department->department_name : "No Department Assigned",
            'section' => $user->userInfos->section ? $user->userInfos->section->section_name : "No Section Assigned",
            'city' => $user->userInfos->city ? $user->userInfos->city->city_name : "No City Assigned",
            'location' => $user->userInfos->branch ? $user->userInfos->branch->branch_name : "No Branch Assigned",
            'role' => $user->userInfos->roles[0]->role_name,
            'last_Logged_in' => $user->last_logged_in,
        ])->render();

        if(!$user){
            return response()->json([
                'message' => 'There is no user with that email',
            ], 404);
        }

        $result = $mailComponent->sendOutlook(
            env('MB_EMAIL'),
            "MBLearn Reset Password Request-".$fullname."-".$user->MBemail ,
            $htmlBody
        );

        return response()->json([
            'message' => 'User Found',
            'user' => $user,
            'RequestSent' => $result,
        ], 200);
    }

    public function refreshToken(Request $request){
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $hashed = hash('sha256', $request->refresh_token);

        $tokenModel = PersonalAccessToken::where('refresh_token', $hashed)->first();

        if(! $tokenModel){
            return response()->json([
                'message' => 'Invalid refresh token',
            ], 401);
        }

        if($tokenModel->expires_at && now()->greaterThan($tokenModel->refresh_expires_at)){
            return response()->json([
                'message' => 'Refresh token has expired',
            ], 401);
        }

        $user = $tokenModel->tokenable;
        $newRefreshToken = Str::random(64);

        $tokenModel->delete();
        // create a new access token but reuse the same DB row
        $newAccessTokenObj = $user->createToken('authToken');
        $newAccessToken    = $newAccessTokenObj->plainTextToken;
        $newTokenModel = $newAccessTokenObj->accessToken;

        // explicitly save refresh token + details on same row
        $newTokenModel->refresh_token = hash('sha256', $newRefreshToken);
        $newTokenModel->ip_address         = $request->ip();
        $newTokenModel->user_agent         = $request->userAgent() ?? 'web';
        $newTokenModel->device_name        = $request->header('Device-Name') ?? 'web';
        $newTokenModel->expires_at         = now()->addMinutes(15);
        $newTokenModel->refresh_expires_at = now()->addDays(7);
        $newTokenModel->save();

        return response()->json([
            'access_token'  => $newAccessToken,
            'refresh_token' => $newRefreshToken, // ⚡ this must be sent back
            'expires_in'    => 15 * 60, // seconds
        ]);
    }
}
