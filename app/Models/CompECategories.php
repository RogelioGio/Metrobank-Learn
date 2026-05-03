<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompECategories extends Model
{
    protected $connection = 'second_connection';
    protected $table = 'categories';

    public function courses():HasMany{
        return $this->hasMany(CompECourse::class, 'CategoryID');
    }
}
