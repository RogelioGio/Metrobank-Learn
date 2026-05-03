<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Training_Mode extends Model
{
    protected $fillable = ['mode_name'];

    public function courses():BelongsToMany{
        return $this->belongsToMany(Course::class, 'traning__mode__course', 'training_mode_id', 'course_id');
    }
}
