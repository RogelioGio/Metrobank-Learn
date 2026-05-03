<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Notifications\Messages\MailMessage;

class BulkAssignCourseAdmins extends FormRequest
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
            "data.*.user_id" => "required|integer|exists:userInfo,id",
            "distributor_id" => "required|integer|exists:userInfo,id"
        ];
    }
}
