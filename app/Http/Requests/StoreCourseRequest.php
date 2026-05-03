<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // TODO be more specific
        return [
            "name" => "required|unique:courses,name",
            "CourseID" => "unique:courses,CourseID",
            "course_outcomes" => "nullable|string",
            "course_objectives" => "nullable|string",
            "description" => "nullable",
            "type_name" => "required",
            "category_name"=> "required",
            "training_type" => "required",
            "months" => "nullable|integer",
            "weeks" => "nullable|integer",
            "days" => "nullable|integer",
            "archived" => "required",
            "lessons.*.LessonName" => "nullable|string",
            "lessons.*.LessonContentAsJSON" => "nullable|string",
            "lessons.*.lesson_type" => "nullable|string",
            "lessons.*.files.*.file_name" => "nullable|string",
            "lessons.*.files.*.file_type" => "nullable|string",
            "lessons.*.files.*.file" => "required|file|mimes:mp4,doc,docx,pdf|max:51200"
        ];
    }

}
