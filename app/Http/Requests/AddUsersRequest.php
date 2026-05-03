<?php

namespace App\Http\Requests;

use App\Models\UserInfos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class AddUsersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    // public function authorize(): bool
    // {
    //     Gate::authorize('create', UserInfos::class);
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
            "employeeID" => "required|string|max:11|unique:userInfo,employeeID",
            "first_name" => "required|string|max:30",
            "last_name" => "required|string|max:30",
            "middle_name" => "nullable|string|max:30",
            "role_id" => "required|integer|exists:roles,id",
            "title_id" => "required|integer|exists:titles,id",
            "branch_id" => "required|integer|exists:branches,id",
            "status" => "nullable|in:Active, Inactive",
            "profile_image" => "nullable|string|max:255",
            "MBemail" => "required|email|unique:userCredentials,MBemail",
            "password" => "required|string|min:8",
            "permissions" => "nullable|array",
            "permissions.*.permission_Id" => "integer|exists:permissions,id",
        ];

        //permission : [{perjission_Id: 1}, {permission_Id: 2}, {permission_Id: 3}]
    }

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
