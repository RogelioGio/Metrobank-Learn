<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    /** @use HasFactory<\Database\Factories\CityFactory> */
    use HasFactory, SoftDeletes;
    protected $fillable = ['city_name', 'archived'];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }

    public function branch(): HasMany{
        return $this->hasMany(Branch::class)->withTrashed();
    }
}
