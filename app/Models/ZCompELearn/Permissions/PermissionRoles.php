<?php

namespace App\Models\ZCompELearn\Permissions;

use Illuminate\Database\Eloquent\Model;

class PermissionRoles extends Model
{
    protected $table = 'zconnect_sme_permission_roles';

    protected $fillable = [
        'PermissionID',
    ];
}
