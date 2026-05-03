<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class StoreEnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    
    public function validated($key = null, $default = null)
    {
        $data = parent::validated();

        return collect($data)->mapWithKeys(fn($value, $key) => [Str::snake($key) => $value])->toArray();
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'userId'=> 'required|integer|exists:userInfo,id',
            'courseId'=> ['required', 'integer', 'exists:courses,id', 
                        Rule::unique('enrollments', 'course_id')
                        ->where(function ($query) {
                            return $query->where('user_id', $this->userId);
                        })],
            'enrollerId'=> 'required|integer|exists:userInfo,id'
        ];
    }

    public function messages()
    {
        return [
            'courseId.unique' => 'This learner is already enrolled in the course.'
        ];
    }
}
