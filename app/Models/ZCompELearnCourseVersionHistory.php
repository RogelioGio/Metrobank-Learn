<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCourseVersionHistory extends Model
{
    protected $table = 'zconnect_course_version_histories';

    protected $fillable = [
        'CourseID',
        'UserInfoID',
        'Action',
        'Changes',
    ];

    protected $casts = [
        'Changes' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class, 'CourseID');
    }

    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'UserInfoID');
    }
}
