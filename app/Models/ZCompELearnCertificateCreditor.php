<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCertificateCreditor extends Model
{
    protected $table = 'zconnect_certificate_creditors';

    protected $fillable = [
        'certificate_id',
        'CreditorName',
        'CreditorPosition',
        'SignatureURL_Path',
    ];

    public function certificate()
    {
        return $this->belongsTo(ZCompELearnCertificate::class);
    }
}
