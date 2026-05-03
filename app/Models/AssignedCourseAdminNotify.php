<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignedCourseAdminNotify extends Model
{
    protected $table = "assigned_course_admins_notify";

    protected $fillable = [
        'CourseAdminID',
        'DistributorID',
        'course_id',
        'WillArchiveAt',
        'Reason',
        'IsRejected'
    ];

    protected function casts(): Array{
        return [
            "IsRejected" => 'boolean'
        ];
    }

    public function courseAdmin(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'CourseAdminID');
    }

    public function distributor(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'DistributorID');
    }

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class, 'course_id');
    }
}
