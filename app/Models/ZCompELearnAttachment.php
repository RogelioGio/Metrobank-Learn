<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnAttachment extends Model
{
    protected $table = 'zconnect_attachments';

    protected $fillable = [
        'course_id',
        'FileName',
        'FilePath',
        'VideoName',
        'VideoPath',
        'AttachmentDescription',
        'AttachmentDuration',
        'AttachmentType',
        'currentOrderPosition',
        'Trashed',
    ];

    protected $casts = [
        'Trashed' => 'boolean',
    ];

    public function createdCourse()
    {
        return $this->belongsTo(ZcomPELearnCreatedCourse::class, 'course_id');
    }
}
