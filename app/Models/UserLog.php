<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLog extends Model
{
    use HasFactory;
    protected $table = 'user_logs';

    protected $fillable = [
        'user_infos_id',
        'log_type',
        'log_description',
        'log_timestamp',
        'ip_address',
        'created_at',
        'updated_at',
    ];

    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'user_infos_id');
    }
}
