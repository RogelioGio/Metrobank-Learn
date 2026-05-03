<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCustomBlock extends Model
{
    protected $table = 'zconnect_custom_blocks';

    protected $fillable = ['BlockData', 'QuestionType', 'AssessmentID'];

    protected $casts = [
        'BlockData' => 'array',
    ];

    public function test()
    {
        return $this->belongsTo(ZCompELearnTest::class, 'AssessmentID');
    }

    public function questions()
    {
        return $this->hasMany(ZCompELearnCustomQuestion::class);
    }
}
