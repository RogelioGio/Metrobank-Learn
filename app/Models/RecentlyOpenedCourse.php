<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\UserInfos;
use App\Models\Course;
use Illuminate\Database\Eloquent\Model;

class RecentlyOpenedCourse extends Model
{
     use HasFactory;

    protected $table = 'recently_opened_courses';

    protected $fillable = [
        'user_info_id',
        'course_id',
        'last_opened_at',
    ];

    protected $casts = [
        'last_opened_at' => 'datetime',
    ];

    // Relationships
    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'user_info_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}

