<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnFile extends Model
{
    protected $table = 'zconnect_files';

    protected $fillable = [
        'lesson_id',
        'file_type',
        'file_path',
        'file_name',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}