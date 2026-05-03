<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    /** @use HasFactory<\Database\Factories\BranchFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['branch_name', 'archived', 'city_id'];
    protected $dates = ['deleted_at'];

    public function casts(): Array{
        return [
            'archived' => 'boolean',
        ];
    }

    public function scopeActive($query){
        return $query->whereNull('deleted_at');
    }

    public function city(): BelongsTo{
        return $this->belongsTo(City::class);
    }

    public function users(): HasMany{
        return $this->hasMany(UserInfos::class, 'branch_id');
    }
}
