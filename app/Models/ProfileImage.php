<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileImage extends Model
{
    /** @use HasFactory<\Database\Factories\ProfileImageFactory> */
    use HasFactory;

    public $fillable = [
        'image_name',
        'image_path',
    ];

    public function user()
    {
        return $this->belongsTo(UserInfos::class, 'user_id');
    }
}
