<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnAssessmentType extends Model
{
    protected $fillable = ['AssessmentTypeName'];

    public function blocks()
    {
        return $this->hasMany(ZCompELearnCustomBlock::class, 'assessment_type_id');
    }
}
