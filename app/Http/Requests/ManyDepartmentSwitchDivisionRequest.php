<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManyDepartmentSwitchDivisionRequest extends FormRequest
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
        return [
            "data.*.id" => "required|integer|exists:departments,id",
            "division_id" => "required|integer|exists:divisions,id"
        ];
    }
}
