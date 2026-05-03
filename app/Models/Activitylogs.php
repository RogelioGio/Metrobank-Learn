<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activitylogs extends Model
{
    protected $fillable = ["user_id", "user_name", "action", "description", "target"];

    public function user():BelongsTo{
        return $this->belongsTo(UserInfos::class);
    }
}
