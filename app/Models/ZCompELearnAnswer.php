<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZCompELearnAnswer extends Model
{
    protected $table = 'zconnect_answer';

    use HasFactory;

    protected $fillable = [
        'OptionText',
        'EssayText',
        'is_correct',
        'question_id',
    ];

    public function test()
    {
        return $this->belongsTo(ZCompELearnQuestion::class);
    }

}

