<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCustomAnswer extends Model
{
    protected $table = 'zconnect_custom_answers';

    protected $fillable = ['custom_question_id', 'content', 'type'];

    public function question()
    {
        return $this->belongsTo(ZCompELearnCustomQuestion::class);
    }
}

