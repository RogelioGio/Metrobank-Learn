<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;


class SelfEnrollRequest extends FormRequest
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
            '*.courseId'=> ['required', 'integer', 'exists:courses,id', 'distinct'],
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
