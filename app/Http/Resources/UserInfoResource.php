<?php

namespace App\Http\Resources;

use App\Models\Branch;
use App\Models\CareerLevel;
use App\Models\City;
use App\Models\Department;
use App\Models\Division;
use App\Models\Title;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserInfoResource extends JsonResource
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
            'employeeID'=> $this->employeeID,
            'first_name'=> $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'name_suffix' => $this->name_suffix,
            'title' => TitleResource::make(
                $this->relationLoaded('title') ? ($this->title ?? tap(new Title([
                    'id' => 0,
                    'title_name' => 'No title',
                ]), function ($title){
                        $department = tap(
                            new Department([
                                'id' => 0,
                                'department_name' => 'No department',
                            ]),
                            function($department){
                                $department->setRelation('division', new Division([
                                    'id' => 0,
                                    'division_name' => 'No division',
                                ]));
                        });
                        $career_level = new CareerLevel([
                                'id' => 0,
                                'name' => 'No career level'
                        ]);
                        $title->setRelation('department', $department);
                        $title->setRelation('careerLevel', $career_level);
                    })) : null
                ),
            'title_id' => $this->title_id,
            'branch'=> BranchResource::make(
                $this->relationLoaded('branch') ? ($this->branch ?? new Branch([
                    'id' => 0,
                    'branch_name' => 'no branch'
                ])) : null
            ),
            'branch_id' => $this->branch_id,
            'city' => CityResource::make(
                $this->relationLoaded('city') ? ($this->city ?? new City([
                    'id' => 0,
                    'city_name' => 'no city'
                ])) : null
            ),
            'roles' => $this->roles,
            'permissions' => $this->permissions,
            'status' => $this->status,
            'is_admin' => $this->is_admin,
            'profile_image' => $this->profile_image,
            'user_credentials' => UserCredentialsResource::make($this->whenLoaded('userCredentials')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'request_id' => $this->whenHas('request_id'),
            'start_date' => $this->whenHas('start_date'),
            'end_date' => $this->whenHas('end_date'),
        ];
    }
}
