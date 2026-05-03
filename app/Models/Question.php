<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'QuestionType',
        'BlockData',
        'AssessmentID',
    ];



    /**
     * A question belongs to a test.
     */
    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class, 'AssessmentID');
    }

    public function attempts(): BelongsToMany{
        return $this->belongsToMany(User_Test_Attempt::class, 'question_user_info', 'question_id', 'attempt_id')
                    ->using(Attempt_Question::class)
                    ->withPivot(['UserAnswer', 'correct'])
                    ->withCasts(['correct' => 'boolean']);
    }

    public function score(){
        $blockData = json_decode($this->BlockData, true);
        return $blockData['points'];
    }
}
