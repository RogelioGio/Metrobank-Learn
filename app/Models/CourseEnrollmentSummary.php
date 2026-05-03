<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseEnrollmentSummary extends Model
{
    protected $table = 'course_enrollment_status_count';

    protected $fillable = [
        'course_id',
        'recorded_at',
        'enrolled_count',
        'ongoing_count',
        'finished_count',
        'past_due_count',
    ];

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class, 'course_id');
    }
}
