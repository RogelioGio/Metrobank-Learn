<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnReports extends Model
{
    protected $table = 'zconnect_reports';

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'browser',
        'platform',
        'login_at',
        'logout_at',
    ];

    public function user()
    {
        return $this->belongsTo(userInfos::class);
    }
    public function activityLogs()
    {
        return $this->hasMany(ZCompELearnActivityLogs::class, 'session_id', 'session_id');
    }
}
