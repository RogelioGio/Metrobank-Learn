<?php

namespace App\Models\ZCompELearn\Permissions;

use Illuminate\Database\Eloquent\Model;

class CoursePermissions extends Model
{
    protected $table = 'zconnect_sme_permissions';

    protected $fillable = [
        'name',
        'guard_name',
    ];
}
