<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = ['category_name', 'archived'];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }

    public function Courses():BelongsToMany{
        return $this->belongsToMany(Course::class, 'category__course', 'category_id', 'course_id');
    }
}
