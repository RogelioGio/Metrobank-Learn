<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Attempt_Question extends Pivot
{
    protected $table = 'question_user_info';

    protected $fillable = [
        'attempt_id',
        'question_id',
        'UserAnswer',
        'correct'
    ];

    protected function casts(): Array{
        return [
            "correct" => 'boolean'
        ];
    }

    public function question(): BelongsTo{
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function attempt(): BelongsTo{
        return $this->belongsTo(User_Test_Attempt::class, 'attempt_id');
    }
}
