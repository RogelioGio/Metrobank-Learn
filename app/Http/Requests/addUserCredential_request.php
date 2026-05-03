<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class addUserCredential_request extends FormRequest
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
            'employeeID' => 'required|string|unique:userInfos,employeeID',
            'MBemail' => 'required|email|unique:userCredentials,MBemail',
            'password' => 'required|string|min:8',
        ];
    }

    /**
     * Get custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.in' => 'The selected role is invalid. Please choose from "System Admin", "Course Admin", or "Learner".',
            'MBemail.unique' => 'The working metrobank email address is already in use.',
            'employeeID.unique' => 'This employee ID is already registered.',
            'name.unique' => 'This name is already registered.',
        ];
    }
}
