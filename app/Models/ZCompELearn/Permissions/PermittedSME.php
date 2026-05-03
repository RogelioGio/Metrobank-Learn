<?php

namespace App\Models\ZCompELearn\Permissions;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserInfos;

class PermittedSME extends Model
{
    protected $table = 'zconnect_sme_permitted';

    protected $fillable = [
        'PermittedID',
        'PermissionsID',
        'course_id'
    ];

    public function user()
    {
        return $this->belongsTo(UserInfos::class, 'PermittedID', 'id');
    }
}
