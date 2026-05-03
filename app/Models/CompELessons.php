<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompELessons extends Model
{
    protected $connection = 'second_connection';
    protected $table = 'lessons';

    public function course(): BelongsTo{
        return $this->belongsTo(CompECourse::class, 'course_id');
    }
}
