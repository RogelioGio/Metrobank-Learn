<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;

class Department extends Model
{
     /** @use HasFactory<\Database\Factories\DivisionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'department_name',
        'division_id',
        'archived',
    ];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }

public function division(): BelongsTo {
    return $this->belongsTo(Division::class, 'division_id');
}

public function titles(): HasMany {
    return $this->hasMany(Title::class, 'department_id');
}
}
