<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnDeletedCoursesRetention extends Model
{
    protected $table = 'zconnect_deleted_courses_retention';

    protected $fillable = [
        'user_info_id',
        'RetentionValue',
        'RetentionUnit',
        'AutoDelete',
        'SettingsUpdatedAt',
    ];
}
