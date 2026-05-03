<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnQuestion extends Model
{
    protected $table = 'zconnect_questions';

    protected $fillable = [
        'QuestionText',
        'QuestionPoints',
        'QuestionImage',
        'QuestionYoutube',
        'test_id',
    ];

    public function test()
    {
        return $this->belongsTo(ZCompELearnTest::class);
    }
    public function answers()
    {
        return $this->hasMany(ZCompELearnAnswer::class);
    }
}
