<?php

namespace Database\Factories;

use App\Models\UserInfos;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class UserCredentialsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'MBemail' => fake()->email(),
            'password' => bcrypt(fake()->password(8,20)),
        ];
    }
}
