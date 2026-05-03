<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseUserAssigned extends Pivot
{

    protected $table = 'course_userinfo_assignment';
    public $incrementing = true;
    protected $primaryKey = 'id';

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'course_userinfo_assignment_permissions', 'assign_id', 'permission_id');
    }
}
