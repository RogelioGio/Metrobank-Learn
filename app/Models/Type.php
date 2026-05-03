<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Type extends Model
{
    protected $fillable = ['type_name'];

    public function Courses(): BelongsToMany{
        return $this->belongsToMany(Course::class, 'type_course', 'type_id', 'course_id');
    }
}
