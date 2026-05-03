<?php

namespace App\Http\Requests;

use App\Models\Title;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateTitleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    // public function authorize(): bool
    // {
    //     Gate::authorize('update', Title::class);
    //     return true;
    // }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "title_name" => "required|string",
            "department_id" => "nullable|integer|exists:depaartments,id",
            "career_level_id" => "nullable|integer|exists:career_levels,id",
        ];
    }
}
