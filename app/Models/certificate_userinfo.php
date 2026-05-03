<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class certificate_userinfo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'certificate_id',
        'date_finished',
        'outside_certificate_url',
        'external_certificate',
        'external_certificate_name',
        'archived',
    ];

    protected function casts(): Array{
        return [
            'external_certificate' => 'boolean',
            'archived' => 'boolean',
        ];
    }

    public function user(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_id');
    }

    public function certificate(): BelongsTo{
        return $this->belongsTo(Certificate::class, 'certificate_id');
    }
}
