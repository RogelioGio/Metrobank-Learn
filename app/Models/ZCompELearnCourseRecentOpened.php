<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZCompELearnCourseRecentOpened extends Model
{
    use HasFactory;

    protected $table = 'zconnect_course_recent_opened_course';

    protected $fillable = [
        'user_info_id',
        'course_id',
        'last_opened_at',
    ];

    protected $casts = [
        'last_opened_at' => 'datetime',
    ];

    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class , 'user_info_id');
    }

    public function course()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class, 'course_id');
    }
}
