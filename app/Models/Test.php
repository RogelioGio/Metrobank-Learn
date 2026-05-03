<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Test extends Model
{
    /** @use HasFactory<\Database\Factories\TestFactory> */
    use HasFactory;

     use HasFactory;

    protected $fillable = [
        'currentOrderPosition',
        'TestName',
        'TestDescription',
        'TestType',
        'assessmentDuration',
        'max_attempt',
        'passing_rate',
        'course_id',
    ];

    /**
     * A test belongs to a course.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * A test has many questions.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'AssessmentID');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(User_Test_Attempt::class, 'test_id');
    }

    public function getLatestEnrollment(int $userId){
        return $this->course->enrollments()->where('user_id', $userId)->latest()->first();
    }

    public function passingScore(){
        $questions = $this->questions;
        $maxpoints = 0;
        foreach($questions as $question){
            $maxpoints +=$question->score();
        }
        $passing = $maxpoints * ($this->passing_rate/100);
        return $passing;
    }
}
