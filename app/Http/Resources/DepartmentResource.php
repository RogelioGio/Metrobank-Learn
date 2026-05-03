<?php

namespace App\Http\Resources;

use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
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
            'department_name' => $this->department_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'division_id' => $this->division_id,
            'division' => DivisionResource::make(
                $this->relationLoaded('division') ? ($this->division ?? new Division(['id' => 0, 'division_name' => "no division"])) : null

            )
        ];
    }
}
