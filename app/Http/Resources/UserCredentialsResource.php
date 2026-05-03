<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCredentialsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'MBemail'=> $this->MBemail,
            'first_log_in' => $this->first_log_in,
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_logged_in' => $this->last_logged_in,
            'phone_number' => $this->whenHas('phone_number'),
            'user_infos' => UserInfoResource::make($this->whenLoaded('userInfos')),
        ];
    }
}
