<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class 
BulkStoreEnrollmentRequest extends FormRequest
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
            '*.userId'=> 'required|integer|exists:userInfo,id',
            '*.courseId'=> ['required', 'integer', 'exists:courses,id'],
            '*.enrollerId'=> 'required|integer',
            '*.start_date'=> 'required|date_format:Y-m-d H:i:s',
            '*.end_date' => 'required|date_format:Y-m-d H:i:s'
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated();

        return array_map(function ($item) {
            return collect($item)
                ->mapWithKeys(fn($value, $key) => [Str::snake($key) => $value])
                ->toArray();
        }, $data);
    }
}
