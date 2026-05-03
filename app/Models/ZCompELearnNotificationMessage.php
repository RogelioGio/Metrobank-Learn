<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnNotificationMessage extends Model
{
    protected $table = 'zconnect_notification_messages';

    protected $fillable = [
        'user_info_id',
        'course_id',
        'CourseName',
        'AssignerName',
        'Message',
        'ReadAt',
    ];

    protected $casts = [
        'ReadAt' => 'datetime',
    ];
}
