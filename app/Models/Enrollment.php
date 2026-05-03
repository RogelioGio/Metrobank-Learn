<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Enrollment extends Model
{
    /** @use HasFactory<\Database\Factories\EnrollmentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'enroller_id',
        //'enrolled', 'ongoing', 'finished', 'late_finish', 'due-soon', 'past-due', 'failed'
        'enrollment_status',
        'due_soon',
        'start_date',
        'end_date',
    ];

    protected function casts(): Array{
        return [
            'due_soon' => 'boolean',
            'allow_late' => 'boolean',
        ];
    }

    public function enrolledUser(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_id', 'id');
    }

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class);
    }

    public function enroller(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'enroller_id', 'id');
    }

    public function lessons(): BelongsToMany{
        return $this->belongsToMany(Lesson::class, 'learner_progress', 'enrollment_id', 'lesson_id')->withPivot('is_completed');
    }

    public function attachments(): BelongsToMany{
        return $this->belongsToMany(Attachment::class, 'learner_progress', 'enrollment_id', 'attachment_id')->withPivot('is_completed');
    }

    public function tests(): BelongsToMany{
        return $this->belongsToMany(Test::class, 'user__test__attempts', 'enrollment_id', 'test_id')->withPivot('score', 'is_completed');
    }


}