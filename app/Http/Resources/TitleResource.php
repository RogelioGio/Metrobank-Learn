<?php

namespace App\Http\Resources;

use App\Models\CareerLevel;
use App\Models\Department;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TitleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_name' => $this->title_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'career_level_id' => $this->career_level_id,
            'career_level' => CareerLevelResource::make(
                $this->relationLoaded('careerLevel') ? ($this->careerLevel ?? new CareerLevel([
                    'id' => 0,
                    'name' => 'No career level',
                ])) : null
            ),
            'department_id' => $this->department_id,
            'department' => DepartmentResource::make(
                $this->relationLoaded('department') ? ($this->department ?? new Department([
                        'id' => 0, 'department_name' => "No department", 'division' => new Division([
                            'id' => 0,
                            'division_name' => 0
                        ])
                    ])) : null
            ),
            'archived' => $this->archived,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
