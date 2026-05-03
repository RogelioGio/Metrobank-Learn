<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArchiveRestoreDeleteMultipleFormInputsRequest extends FormRequest
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
            'data.*.id' => 'required|integer',
            'type' => 'required|string|in:branch,careerlevel,carouselimage,category,externalcertificate,city,department,division,permission,role,title',
            'action' => 'required|string|in:archive,restore,delete',
        ];
    }

    public function messages(){
        return [
            'type.in' => 'The type you entered was not in branch,careerlevel,carouselimage,category,externalcertificate,city,department,division,permission,role,title',
            'action.in' => 'The action you entered is not archive,restore,delete'
        ];
    }
}
