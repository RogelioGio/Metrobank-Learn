<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Attachment extends Model
{
    /** @use HasFactory<\Database\Factories\AttachmentFactory> */
    use HasFactory;

     protected $fillable = [
        'FileName',
        'FilePath',
        'VideoName',
        'VideoPath',
        'course_id',
        'currentOrderPosition',
        'AttachmentDescription',
        'AttachmentType',
        'attachmentDuration',
    ];

    /**
     * An attachment belongs to a course.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
