<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Certificate extends Model
{
    protected $fillable = [
        'course_id',
        'background_img_url',
        'CertificateName'
    ];

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function creditors(): HasMany{
        return $this->hasMany(Certificate_Creditors::class);
    }
}
