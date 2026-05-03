<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearnerEngagement extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'recorded_at',
    ];

    public function user(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_id');
    }

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class, 'course_id');
    }
}
