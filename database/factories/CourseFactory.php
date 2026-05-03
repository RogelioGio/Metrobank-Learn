<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "name" => fake()->name(),
            "description" => fake()->paragraph(1),
            'type_id' => fake()->randomElement(['1']),
            'category_id'=> fake()->randomElement(['1']),
            'training_mode_id'=> fake()->randomElement(['1']),
            "mandatory" => fake()->randomElement(["Mandatory", "Non-Mandatory"]),
            "archived" => "active",
            "system_admin_id" => fake()->randomElement(['1']),
            "assigned_course_admin_id" => fake()->randomElement(['1'])
        ];
    }
}
