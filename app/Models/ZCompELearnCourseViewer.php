<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZCompELearnCourseViewer extends Model
{
    use HasFactory;

    protected $table = 'zconnect_course_to_be_review';
    protected $fillable = [
        'course_id',
        'user_info_id',
        'approval_status',
        'feedback',
        'user_credentials_id',
    ];

    // Relationships

    public function course()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class, 'course_id');
    }

    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'user_info_id');
    }
}
