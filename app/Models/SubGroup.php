<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subgroup extends Model
{
    /** @use HasFactory<\Database\Factories\SubgroupFactory> */
    use HasFactory;

    protected $fillable = ['group_name'];

    public function users():HasMany{
        return $this->hasMany(UserInfos::class, 'group_id');
    }
}
