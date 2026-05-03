<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    /** @use HasFactory<\Database\Factories\LessonFactory> */
    use HasFactory;

    protected $casts = [
        'lesson_content_as_json' => 'array',
    ];

    protected $fillable = [
        'lesson_name',
        'lesson_content_as_json',
        'currentOrderPosition', // ✅ updated (instead of lesson_type)
        'course_id',
        'lessonDuration',
    ];

    /**
     * A lesson belongs to a course.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * A lesson can have many lesson files (attachments specific to lessons).
     */
    public function files(): HasMany
    {
        return $this->hasMany(LessonFile::class, 'lesson_id');
    }

    /**
     * A lesson can belong to many learners (via learner_progress pivot table).
     */
    public function learners(): BelongsToMany
    {
        return $this->belongsToMany(UserInfos::class, 'learner_progress', 'lesson_id', 'userInfo_id')
            ->withPivot('is_completed')
            ->withCasts(['is_completed' => 'boolean'])
            ->withTimestamps();
    }
}
