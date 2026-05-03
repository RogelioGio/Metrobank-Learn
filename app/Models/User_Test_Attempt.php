<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User_Test_Attempt extends Model
{
    protected $fillable = [
        'user_id',
        'test_id',
        'enrollment_id',
        'score',
        'is_completed',
        'started_at',
        'finished_at'
    ];

    protected function casts(): Array {
        return [
            'is_completed' => 'boolean',
            'started_at'   => 'datetime',
            'finished_at'  => 'datetime',
        ];
    }

    public function user(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_id');
    }

    public function test(): BelongsTo{
        return $this->belongsTo(Test::class, 'test_id');
    }

    public function questions(): BelongsToMany{
        return $this->belongsToMany(Question::class, 'question_user_info', 'attempt_id', 'question_id')
                    ->using(Attempt_Question::class)
                    ->withPivot(['UserAnswer', 'correct'])
                    ->withCasts(['correct' => 'boolean']);
    }

}
