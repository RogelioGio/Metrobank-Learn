<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate_Creditors extends Model
{
    protected $table = 'certificate_creditors';

    protected $fillable = [
        'certificate_id',
        'creditor_name',
        'creditor_signature_img_url',
        'creditor_position'
    ];

    public function certificate(): BelongsTo{
        return $this->belongsTo(Certificate::class);
    }
}
