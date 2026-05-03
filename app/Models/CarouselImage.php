<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CarouselImage extends Model
{
    /** @use HasFactory<\Database\Factories\CarouselImageFactory> */
    use HasFactory, SoftDeletes;

    public $fillable = [
        'image_name',
        'image_path',
        'is_selected',
        'order_index',
        'archived',
    ];

    protected function casts(): Array {
        return [
            'is_selected' => 'boolean',
            'archived' => 'boolean',
        ];
    }
}
