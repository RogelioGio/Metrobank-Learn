<?php

namespace App\Models;

use Google\Service\BigQueryDataTransfer\UserInfo;
use Illuminate\Database\Eloquent\Model;

class ZCompELearnCourse extends Model
{
    protected $table = 'zconnect_courses';

    protected $fillable = [
        'CourseName', 
        'CourseDescription', 
        'DepartmentName', 
        'ImagePath', 
        'CreatorName', 
        'CreatorID', 
        'CallingID', 
        'CourseType', 
        'Course_ID',
        'CategoryName',
        "CourseObjectives"
    ]; 

    public function departments()
    {
        return $this->belongsTo(Department::class, 'department_name');
    }
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_name');
    }
    
    public function lessons()
    {
        return $this->hasMany(ZCompELearnLesson::class);
    }
    public function tests()
    {
        return $this->hasMany(ZCompELearnTest::class);
    }
    public function certificate()
    {
        return $this->hasOne(ZCompELearnCertificate::class);
    }
    public function comments()
    {
        return $this->hasMany(ZCompELearnComment::class);
    }



    public static function booted()
    {
        static::created(function ($model) {
            self::logActivity('created', $model, [
                'new' => $model->toArray(),
            ]);
        });

        static::updated(function ($model) {
            self::logActivity('updated', $model, [
                'old' => $model->getOriginal(),
                'new' => $model->getChanges(),
            ]);
        });

        static::deleted(function ($model) {
            self::logActivity('deleted', $model, [
                'old' => $model->getOriginal(),
            ]);
        });
    }



    protected static function logActivity($action, $model, $changes = null)
    {
        $sessionId = ZCompELearnReports::where('user_id', auth()->id()) 
                            ->orderBy('login_at', 'desc')
                            ->value('session_id');

        $activityLog = ZCompELearnActivityLogs::create([
            'user_id' => auth()->id(),
            'session_id' => $sessionId,
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'changes' => $changes,
        ]);
    }
    
    public function permittedUsers()
    {
        return $this->belongsToMany(UserInfo::class, 'course_user_permissions')
                    ->withPivot(['can_edit_lessons', 'can_edit_tests'])
                    ->withTimestamps();
    }
    
    public function getUpdatedAtFormattedAttribute()
    {
        return $this->updated_at
                    ->timezone('Asia/Manila')
                    ->format('Y-m-d h:i A');
    }
}


