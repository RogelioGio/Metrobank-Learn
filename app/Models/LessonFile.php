<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonFile extends Model
{
    /** @use HasFactory<\Database\Factories\LessonFileFactory> */
    use HasFactory;

    public $fillable = ['file_name', 'file_path', 'file_type'];

    public function lesson(): BelongsTo{
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
