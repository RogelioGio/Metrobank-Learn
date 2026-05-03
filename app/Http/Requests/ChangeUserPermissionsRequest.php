<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeUserPermissionsRequest extends FormRequest
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
            'MBemail' => ['required', 'string', Rule::unique('userCredentials')->ignore($this->MBemail, 'MBemail')],
            'password' => "nullable|string|min:8",
            'role_id' => 'required|integer|exists:roles,id',
            'permissions' => 'array',
            'permissions.*.permission_Id' => 'integer|exists:permissions,id',
        ];
    }
}
