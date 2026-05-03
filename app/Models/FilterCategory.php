<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterCategory extends Model
{
    use HasFactory;
    protected $table = 'filter_categories';

    protected $fillable = ['filter_id', 'name'];

    public function options() {
        return $this->hasMany(FilterOption::class, 'filter_category_id');
    }
}
