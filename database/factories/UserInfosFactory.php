<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\UserCredentials;
use App\Models\UserInfos;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserInfos>
 */
class UserInfosFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = $this->faker->randomElement(['Learner', 'System Admin', 'Course Admin']);
        $department = $this->faker->randomElement(['Human Resource', 'Internal Audit', 'IT Department', 'Finance', 'Operations Management']);
        $branch = $this->faker->randomElement(['Quezon Avenue', 'West Triangle', 'West Avenue', 'Novaliches', 'Tandang Sora', 'Kamuning', 'Valencia Hills']);
        return [
            'employeeID'=> fake()->randomNumber(5),
            'first_name' => fake()->name(),
            'last_name' => fake()->name(),
            'middle_name' => fake()->randomLetter(),
            'branch' => $branch,
            'title'=> fake()->title(),
            'city'=> fake()->city(),
            'status'=> 'Active',
            'department'=> $department,
            'user_credentials_id'=> UserCredentials::factory(),
        ];
    }
    // public function configure()
    // {
    //     return $this->afterCreating(function (UserInfos $user) {
    //         $userRole = Role::where('role_name', 'learner')->first();
    //         if ($userRole) {
    //             $user->roles()->attach($userRole->id);
    //         }
    //     });
    // }
}
