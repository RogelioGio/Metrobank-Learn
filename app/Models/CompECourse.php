<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompECourse extends Model
{
    protected $connection = 'second_connection';
    protected $table = 'courses';

    public function category():BelongsTo{
        return $this->belongsTo(CompECategories::class, 'CategoryID');
    }

    public function lessons():HasMany{
        return $this->hasMany(CompELessons::class, 'course_id');
    }
}
