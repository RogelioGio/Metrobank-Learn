<?php

namespace App\Models;
use App\Models\UserCredentials;
use Illuminate\Database\Eloquent\Model;

class UserOtp extends Model
{
    protected $fillable =[
        'user_creds_id',
        'otp',
        'expires_at',
    ];
    protected $dates = [
        'expires_at',
    ];

    public function user()
    {
        return $this->belongsTo(UserCredentials::class, 'user_creds_id');
    }
}
