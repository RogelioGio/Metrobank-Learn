<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnLesson extends Model
{
    protected $table = 'zconnect_lessons';

    protected $fillable = [
        'LessonName', 
        'LessonDescription',
        'LessonDuration',
        'course_id',
        'currentOrderPosition', 
        'Trashed',
    ];

    protected $casts = [
        'Trashed' => 'boolean',
    ];

    public function createdCourse()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class, 'course_id');
    }

    public function files()
    {
        return $this->hasMany(ZCompELearnFile::class);
    }

    protected static function booted()
    {
        static::saved(function ($lesson) {
            $lesson->createdCourse->touch();
        });

        static::deleted(function ($lesson) {
            $lesson->createdCourse->touch();
        });
    }
}
