<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelfEnrollmentRequest extends Model
{
    protected $table = 'self_enrollment_requests';
    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'start_date',
        'end_date'
    ];

    public function user(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_id');
    }

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class, 'course_id');
    }
}
