<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = ['title', 'description', 'data', 'generated_by','expire_at',];

    protected $casts = [
        'data' => 'array',
    ];
}
