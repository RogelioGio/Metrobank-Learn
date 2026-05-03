<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnActivityLogs extends Model
{
    protected $table = 'zconnect_activity_logs';
    
    protected $fillable = [
        'session_id',
        'action',
        'model_type',
        'model_id',
        'changes',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->morphTo(null, 'model_type', 'model_id');
    }

    public function report()
    {
        return $this->belongsTo(ZCompELearnReports::class, 'session_id', 'session_id');
    }
}


