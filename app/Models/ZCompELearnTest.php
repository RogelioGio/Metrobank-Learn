<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnTest extends Model
{
    protected $table = 'zconnect_tests';

    protected $fillable = [
        'TestName',
        'TestDescription',
        'AssessmentDuration',
        'course_id',
        'TestType',
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
    

    public function customBlocks()
    {
        return $this->hasMany(ZCompELearnCustomBlock::class, 'AssessmentID');
    }


    public function questions()
    {
        return $this->hasMany(ZCompELearnQuestion::class);
    }

    protected static function booted()
    {
        static::saved(function ($test) {
            $test->createdCourse->touch();
        });

        static::deleted(function ($test) {
            $test->createdCourse->touch();
        });
    }
}
