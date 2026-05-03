<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnComment extends Model
{
    protected $table = 'zconnect_comments';

    protected $fillable = [ 'Sender', 'Recipient', 'Comment', 'MessageType', 'course_id', 'created_at' ];

    public function createdCourse()
    {
        return $this->belongsTo(ZCompELearnCreatedCourse::class);
    }
}

