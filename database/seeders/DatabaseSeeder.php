<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserCredentials;
use App\Models\UserInfos;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        //     'password' => Hash::make('testing')
        // ]);
        // $roles = ['System Admin', 'Course Admin', 'Learner'];
        // foreach($roles as $role){
        //     Role::create([
        //         'role_name' => $role
        //     ]);
        // }

        $firstcreds = UserCredentials::create([
            'MBemail'=> 'mb_learn@outlook.com',
            'password' => "MB_OUTLOOK020202",
            'first_log_in' => true,
        ]);

        $firstinfos = UserInfos::create([
            'employeeID' => '00000000001',
            'first_name' => 'Metrobank',
            'last_name' => 'Root Account',
            'middle_name'=> '',
            'status'=> 'Active',
            'profile_image'=> 'https://ui-avatars.com/api/?name=Metrobank&color=ffffff&background=03045e&bold=true&size=400',
        ]);

        $firstcreds->userInfos()->save($firstinfos);
        $firstinfos->userCredentials()->associate($firstcreds);
        $firstinfos->save();
        // $roles = ['System Admin', 'Course Admin', 'Learner', 'SME-Creator', 'SME-Approver', 'SME-Distributor'];
        // foreach($roles as $role){
        //     Role::create([
        //         'role_name' => $role
        //     ]);
        // }
        $systemAdmin = Role::where('role_name', 'System Admin')->pluck('id');
        $permissions = Permission::all()->pluck('id');
        $userInfos = UserInfos::first();
        $userInfos->roles()->sync($systemAdmin);
        $userInfos->permissions()->sync($permissions);

        // UserInfos::factory(10)->create();
        // Course::factory(10)->create();
    }
}
