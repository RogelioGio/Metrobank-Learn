<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhoneNumberRequest extends FormRequest
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
            'phone_number' => ['required', 'string', 'unique:userCredentials,phone_number'],

        ];
    }

    public function messages(): array
    {
        return [
            'phone_number.regex' => 'Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone_number' => $this->normalizePhone($this->phone_number),
        ]);
    }

        protected function normalizePhone($phone_number): ?string
    {   
        if (!$phone_number) return null;

        $clean = preg_replace('/[^0-9\+]/', '', $phone_number);

        if (str_starts_with($clean, '09')) {
            $clean = '+63' . substr($clean, 1);
        }

        return $clean;
    }
}
