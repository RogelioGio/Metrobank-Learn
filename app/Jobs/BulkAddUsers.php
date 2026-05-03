<?php

namespace App\Jobs;

use App\Events\BulkUserAddedEvent;
use App\Events\UserAddedEvent;
use App\Http\Requests\BulkStoreUserRequest;
use App\Models\Branch;
use App\Models\Role;
use App\Models\Title;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use App\Models\UserLog;
use App\Notifications\BulkAddDoneNotification;
use App\Notifications\BulkUserAddedNotification;
use App\Notifications\WelcomeToMBLearnNotification;
use App\Services\UserLogService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class BulkAddUsers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public array $bulk, public string $email, public int $count, public int $id, public string $ip)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $output = [];
        $count = 0;
        $roles = Role::all()->keyBy('role_name');
        $titles = Title::all()->keyBy('title_name');
        $branches = Branch::all()->keyBy('branch_name');
        $user = UserCredentials::query()->where('MBemail', $this->email)->first();
        $adderInfo = $user->userInfos;
        $logs = [];

        foreach($this->bulk as $single){
            $existing = UserInfos::query()->where('employeeID', '=', $single['employeeID'])->exists();
            $fullName = trim($single['first_name'].' '.
                (!empty($single['middle_name']) ? $single['middle_name'].' ': '').
                $single['last_name']. ' '.
                (!empty($single['name_suffix']) ? $single['name_suffix'].' ': ''));

            if($existing){
                $output[1][] = "Employee: ".$fullName." employee ID is already taken";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }

            if(!preg_match('/^\d+$/', $single['employeeID'])){
                $output[1][] = "Employee: ".$fullName." employee ID is not all numbers";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }

            $email = strtolower($single['MBemail']);
            $password = preg_replace('/\s+/', '', $single['first_name'])."_".$single['employeeID'];
            $empID = $single['employeeID'];
            $role = $roles[$single['role']] ?? null;
            $title = $titles[$single['title']] ?? null;
            $branch = $branches[$single['branch']] ?? null;
            $profile_image = 'https://ui-avatars.com/api/?name=' . urlencode($fullName) . '&color=ffffff&background=03045e&bold=true&size=400';

            $status = $single['status'] ?? 'Active';
            $existingEmail = UserCredentials::where('MBemail', $email)->first();

            if(11 > strlen($empID)){
                $output[1][] = "Employee: ".$fullName."'s employee ID is less than 11 characters";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }

            if($existingEmail){
                $output[1][] = "Employee:".$fullName."'s email is already taken";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }

            if(!$title){
                $output[1][] = "Employee: ".$fullName." has an invalid title";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }
            if(!$role){
                $output[1][] = "Employee: ".$fullName." has an invalid role";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }
            if(!$branch){
                $output[1][] = "Employee: ".$fullName." has an invalid branch";
                $logs[] = [
                    "user_infos_id" => $this->id,
                    "log_type" => 'BulkAddedUsers',
                    "log_description" => $adderInfo->fullName()." was unsuccessful in adding a user.",
                    "ip_address" => $this->ip,
                    "log_timestamp" => now(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
                continue;
            }
            $userCredentials = UserCredentials::create([
                "MBemail" => $email,
                "password" => $password
            ]);

            $userInfo = UserInfos::create([
                'employeeID' => $single['employeeID'],
                'first_name' => $single['first_name'],
                'last_name' => $single['last_name'],
                'middle_name' => !empty($single['middle_name']) ? $single['middle_name'].' ': '',
                'name_suffix' => !empty($single['name_suffix']) ? $single['name_suffix'].' ': '',
                'status' =>$status,
                'profile_image' =>$profile_image
            ]);
            $count += 1;
            Log::info('test', [$branch, $title, $role]);
            $userInfo->branch()->associate($branch);
            $userInfo->title()->associate($title);
            $userInfo->roles()->sync([$role->id]);
            $userInfo->save();
            $userCredentials->userInfos()->save($userInfo);
            $permissions = $role->permissions->toArray();
            PermissionToUser::dispatch($userInfo, $permissions);
            $userCredentials->notify(new WelcomeToMBLearnNotification($single['first_name'], $single['middle_name'], $single['last_name'], $email, $password));
            $logs[] = [
            "user_infos_id" => $this->id,
            "log_type" => 'BulkAddedUsers',
            "log_description" => $adderInfo->fullName()." has added ".$userInfo->fullName()." to the system.",
            "ip_address" => $this->ip,
            "log_timestamp" => now(),
            "created_at" => now(),
            "updated_at" => now(),
            ];
        }
        UserLog::insert($logs);
        $counts = $count."/".$this->count." Successfully Added Users";
        array_splice($output, 0, 0, $counts);

        $user->notify(new BulkAddDoneNotification($this->count, $count));

        Log::info('Bulk add log', $output);
    }
}
