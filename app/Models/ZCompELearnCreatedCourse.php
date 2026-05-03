<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZCompELearnCreatedCourse extends Model
{
    use HasFactory;

    protected $table = 'zconnect_created_courses';

    protected $fillable = [
        'CourseID',
        'CourseName',
        'Overview',
        'Objective',
        'TrainingType',
        'CourseStatus',
        'Division',
        'CourseDuration',
        'TotalCourseDuration',
        'DeletedAt',
        'ArchivedAt',
        'division_id',
        'career_level_id',
        'category_id',
        'user_info_id',
    ];


    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }
    public function careerLevel()
    {
        return $this->belongsTo(CareerLevel::class, 'career_level_id');
    }
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
    public function userInfo()
    {
        return $this->belongsTo(UserInfos::class, 'user_info_id');
    }
    public function approvers()
    {
        return $this->belongsToMany(UserInfos::class, 'zconnect_course_to_be_review', 'course_id', 'user_info_id')
                    ->withPivot('feedback', 'approval_status', 'created_at', 'updated_at');
    }

    //

    public function lessons()
    {
        return $this->hasMany(ZCompELearnLesson::class, 'course_id', 'id');
    }
    public function tests()
    {
        return $this->hasMany(ZCompELearnTest::class, 'course_id', 'id');
    }
    public function certificates()
    {
        return $this->hasMany(ZCompELearnCertificate::class, 'course_id', 'id');
    }
    public function comments()
    {
        return $this->hasMany(ZCompELearnComment::class);
    }

    public function attachments()
    {
        return $this->hasMany(ZCompELearnAttachment::class, 'course_id', 'id');
    }

    public function courseReview()
    {
        return $this->hasMany(ZCompELearnCourseViewer::class, 'course_id', 'id');
    }

    public function retentionSettings()
    {
        return $this->belongsTo(ZCompELearnDeletedCoursesRetention::class, 'user_info_id', 'user_info_id');
    }

    public function smePermitted()
    {
        return $this->hasMany(ZCompELearn\Permissions\PermittedSME::class, 'course_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(ZCompELearnCourseViewer::class, 'course_id', 'id');
    }
}
