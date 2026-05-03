<?php

namespace App\Http\Requests;

use App\Models\UserInfos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class updateUserInfo extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        Gate::authorize('update', UserInfos::class);
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
            'employeeID' => ['required', 'string', Rule::unique('userInfo')->ignore($this->employeeID, 'employeeID')],
            'first_name' => 'required|string|max:30',
            'last_name' => 'required|string|max:30',
            'middle_name' => 'nullable|string|max:30',
            'name_suffix' => 'nullable|string|max:10',
            'title_id' => 'required|integer|exists:titles,id',
            'branch_id' => 'required|integer|exists:branches,id',
            'image' => "nullable|image|mimes:jpg,jpeg,png|max:2048",
            'status' => 'nullable|in:Active, Inactive',
        ];
    }
}
