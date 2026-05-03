<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory, Searchable;

    protected $fillable = [
    'courseID',
    'courseName',
    'overview',
    'objective',
    'training_type',
    'career_level_id',
    'category_id',
    'user_info_id',
    'image_path',
    'status',
    'courseDuration',
    ];

    public function enrollments(): HasMany{
        return $this->hasMany(Enrollment::class);
    }

    public function lessons(): HasMany{
        return $this->hasMany(Lesson::class);
    }

    public function attachments(): HasMany{
        return $this->hasMany(Attachment::class);
    }

    public function tests(): HasMany{
        return $this->hasMany(Test::class);
    }

    public function enrolledUsers(): BelongsToMany{
        return $this->belongsToMany(UserInfos::class, 'enrollments', 'course_id', 'user_id')
                        ->withPivot('id', 'enrollment_status', 'allow_late', 'due_soon','start_date', 'end_date');
    }

    public function lessonCount(): int{
        return $this->lessons()->count();
    }

    public function certificate(): HasOne{
        return $this->hasOne(Certificate::class, 'course_id');
    }

    public function modulesCount(): int{
        $lessons = $this->lessons()->count();
        $attachments = $this->attachments()->count();
        $test = $this->tests()->count();
        return $lessons + $attachments + $test;
    }

    public function statusEnrolledUsers(){
        return $this->enrollments()->with('enrolledUser')->get()->map(function ($enrollment){
            $user = $enrollment->enrolledUser;
            $user->enrollment_status = $enrollment->enrollment_status;
            $user->due_soon = $enrollment->due_soon;
            return $user;
        });
    }

    //help with better name, basically system admin na nag add ng course
    //I think not used anymore (?)
    public function adder(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'system_admin_id', 'id');
    }

    //IDK if multiple course admin can be assigned to a course, subject to change
    public function assignedCourseAdmins(): BelongsToMany{
        return $this->belongsToMany(UserInfos::class,'course_userinfo_assignment', 'course_id', 'user_id')
            ->using(CourseUserAssigned::class)->withPivot(['id', 'distributor_id']);
    }

    public function distributorAssigner(int $courseAdminId){
        $assigned = $this->assignedCourseAdmins()->wherePivot('user_id', '=', $courseAdminId)->first();
        if($assigned){
            return UserInfos::find($assigned->pivot->distributor_id);
        }
        return null;
    }

    public function categories():BelongsTo{
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function selfEnrollRequests(): HasMany{
        return $this->hasMany(SelfEnrollmentRequest::class, 'course_id');
    }

    public function userSelfEnrollRequests(): BelongsToMany{
        return $this->belongsToMany(UserInfos::class, 'self_enrollment_requests', 'course_id', 'user_id');
    }

    public function types():BelongsToMany{
        return $this->belongsToMany(Type::class, 'type_course', 'course_id', 'type_id');
    }

    public function training_modes():BelongsToMany{
        return $this->belongsToMany(Training_Mode::class, 'traning__mode__course', 'course_id', 'training_mode_id');
    }

    public function career_level(): BelongsTo{
        return $this->belongsTo(CareerLevel::class, 'career_level_id');
    }

    public function course_permissions(): BelongsToMany{
        return $this->belongsToMany(Permission::class, 'course_permission', 'course_id', 'permission_id');
    }

    public function author(): BelongsTo{
        return $this->belongsTo(UserInfos::class, 'user_info_id', 'id');
    }

    public function recentlyOpenedCourses(): HasMany{
        return $this->hasMany(RecentlyOpenedCourse::class, 'course_id');
    }

    public function recentLearnerCourses(): HasMany{
        return $this->hasMany(LearnerRecentCourse::class, 'course_id', 'id');
    }


    public function assessmentAttempts() {
        return $this->hasManyThrough(User_Test_Attempt::class, Test::class, 'course_id', 'test_id', 'id', 'id');
    }


    public function toSearchableArray(){
        $array = $this->toArray();
        $array['name'] = $this->name;
        $array['CourseID'] = $this->CourseID;
        $array['course_outcomes'] = $this->course_outcomes;
        $array['course_objectives'] = $this->course_objectives;
        $array['description'] = $this->description;
        return $array;
    }

    public function archival(): HasMany{
        return $this->hasMany(AssignedCourseAdminNotify::class, 'course_id');
    }

    public function enrollmentstatuscount(): HasMany{
        return $this->hasMany(CourseEnrollmentSummary::class, 'course_id');
    }

    public function learnerengagement():HasMany{
        return $this->hasMany(LearnerEngagement::class, 'course_id');
    }

}
