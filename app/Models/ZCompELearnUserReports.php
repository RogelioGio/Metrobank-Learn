<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnUserReports extends Model
{
    protected $table = 'zconnect_user_reports';

    protected $fillable = [
        'user_info_id',
        'Action',
        'Details',
    ];

      protected $casts = [
        'Details' => 'array',
    ];
}
