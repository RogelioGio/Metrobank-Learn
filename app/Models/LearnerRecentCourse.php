<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearnerRecentCourse extends Model
{
    use HasFactory;

    protected $table = 'learner_recent_courses';

    protected $fillable = [
        'userInfo_id',
        'course_id',
        'last_opened_at',
    ];

    /**
     * Relationship: A LearnerRecentCourse belongs to a UserInfo.
     */
    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'userInfo_id');
    }

    /**
     * Relationship: A LearnerRecentCourse belongs to a Course.
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
