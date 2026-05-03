<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCustomQuestion extends Model
{
    protected $table = 'zconnect_custom_questions';

    protected $fillable = ['question_block_id', 'content', 'type'];

    public function answers()
    {
        return $this->hasMany(ZCompELearnCustomAnswer::class);
    }

    public function block()
    {
        return $this->belongsTo(ZCompELearnCustomBlock::class);
    }
}
