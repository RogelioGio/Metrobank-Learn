<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterOption extends Model {
    use HasFactory;

    protected $fillable = ['filter_category_id', 'value', 'label'];

    public function category() {
        return $this->belongsTo(FilterCategory::class, 'filter_category_id');
    }

    public function courses() {
        return $this->belongsToMany(Course::class, 'course_filters', 'filter_option_id', 'course_id');
    }
}
