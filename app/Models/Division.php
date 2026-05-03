<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Division extends Model
{
    /** @use HasFactory<\Database\Factories\DivisionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'division_name',
        'archived',
    ];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }
    public function departments(): HasMany {
    return $this->hasMany(Department::class, 'division_id', 'id');
    }

}
