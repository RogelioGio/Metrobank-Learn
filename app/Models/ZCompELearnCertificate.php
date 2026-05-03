<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCertificate extends Model
{
    protected $table = 'zconnect_certificates';

    protected $fillable = [
        'course_id',
        'CertificateName'
    ];

    public function course()
    {
        return $this->belongsTo(ZCompELearnCourse::class);
    }
    public function createdCourse()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class);
    }
    public function creditors()
    {
        return $this->hasMany(ZCompELearnCertificateCreditor::class, 'certificate_id');
    }
}
