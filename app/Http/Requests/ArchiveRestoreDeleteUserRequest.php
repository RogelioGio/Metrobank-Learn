<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArchiveRestoreDeleteUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data.*.id' => 'required|integer',
            'action' => 'required|string|in:archive,restore,delete',
        ];
    }

    public function messages(){
        return [
            'action.in' => 'The action you entered is not archive,restore,delete'
        ];
    }
}
