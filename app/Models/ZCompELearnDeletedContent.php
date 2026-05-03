<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZConnectDeletedContent extends Model
{
    protected $table = 'zconnect_deleted_content';

    protected $fillable = [
        'CourseID',
        'LessonID',
        'TestID',
        'AttachmentID',
        'DeletedAt',
    ];

    public $timestamps = true;

    public function course()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class, 'CourseID');
    }

    public function lesson()
    {
        return $this->belongsTo(ZCompELearnLesson::class, 'LessonID');
    }

    public function test()
    {
        return $this->belongsTo(ZCompELearnTest::class, 'TestID');
    }

    public function attachment()
    {
        return $this->belongsTo(ZCompELearnAssessment::class, 'AttachmentID');
    }
}
