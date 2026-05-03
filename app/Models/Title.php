<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Znck\Eloquent\Relations\BelongsToThrough;

class Title extends Model
{
    /** @use HasFactory<\Database\Factories\TitleFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title_name',
        'department_id',
        'career_level_id',
        'archived',
    ];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }

    public function department(){
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function careerLevel(){
        return $this->belongsTo(CareerLevel::class, 'career_level_id');
    }
    public function user()
    {
        return $this->belongsTo(UserInfos::class);
    }

    public function users(): HasMany{
        return $this->hasMany(UserInfos::class);
    }

    use \Znck\Eloquent\Traits\BelongsToThrough;
    public function division():\Znck\Eloquent\Relations\BelongsToThrough{
        return $this->BelongsToThrough(Division::class, Department::class);
    }
}
