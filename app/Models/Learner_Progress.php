<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Learner_Progress extends Model
{
    protected $table = 'learner_progress';

    protected $fillable = ['enrollment_id', 'is_completed', 'attachment_id', 'lesson_id'];
}
