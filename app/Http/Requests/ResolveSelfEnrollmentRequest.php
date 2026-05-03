<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResolveSelfEnrollmentRequest extends FormRequest
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
            "status" => "required|string|in:approved,rejected",
            "list" => "required|array",
            "list.*.request_id" => 'required|integer|exists:self_enrollment_requests,id',
            'list.*.start_date' => 'required_if:status,approved|date|nullable',
            'list.*.end_date' => 'required_if:status,approved|nullable|date',
        ];
    }
}
