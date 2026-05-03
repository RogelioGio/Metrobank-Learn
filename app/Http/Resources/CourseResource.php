<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        //TODO add a way to see the course admin that is assigned and who added the course
        return [
            'id'=> $this->id,
            'courseName'=>$this->courseName,
            'courseID' => $this->courseID,
            'attachments' => $this->whenLoaded('attachments'),
            'author' => $this->whenLoaded('author'),
            'career_level' => $this->whenLoaded('career_level'),
            'career_level_id' => $this->career_level_id,
            'categories' => $this->whenLoaded('categories') ?? new Category(['id' => 0, 'category_name' => 'No Category']),
            'category_id' => $this->category_id,
            'created_at' => $this->created_at,
            'courseDuration' => $this->courseDuration,
            'deadline' => $this->whenHas('deadline'),
            'doneModules' => $this->whenHas('doneModules'),
            'due_soon' => $this->whenHas('due_soon'),
            'enrolled' => $this->whenHas('enrolled'),
            'enrollmentStatus' => $this->whenHas('enrollmentStatus'),
            'image_path' => $this->image_path,
            'lessons' => $this->whenLoaded('lessons'),
            'modules' => $this->whenHas('modules'),
            'objective' => $this->objective,
            'ongoing' => $this->whenHas('ongoing'),
            'overview' => $this->overview,
            'past_due' => $this->whenHas('past_due'),
            'pivot' => $this->whenHas('pivot'),
            'progress' => $this->whenHas('progress'),
            'status' => $this->status,
            'tests' => $this->tests,
            'length' => $this->whenHas('length'),
            'training_type' => $this->training_type,
            'updated_at' => $this->updated_at,
            'user_info_id' => $this->user_info_id,
            'archival_date' => $this->archival_date,

        ];
    }
}
