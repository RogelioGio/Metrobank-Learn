<?php

namespace App\Models;

use App\Observers\UserInfosObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;
use Znck\Eloquent\Relations\BelongsToThrough;
use Illuminate\Notifications\Notifiable;

// use Illuminate\Foundation\Auth\Access\Authorizable;
// use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
// use Spatie\Permission\Traits\HasRoles;
// implements AuthorizableContract*

#[ObservedBy([UserInfosObserver::class])]
/**
 * @property int $id
 */
class UserInfos extends Model
{
    // Added Authorizable and HasRoles and AuthorizableContract

    use HasFactory, Searchable;
    use Notifiable;
    // use Authorizable, HasRoles;

    /**
     * The table associated with the model.
     */
    protected $table = 'userInfo'; // Replace with your actual table name

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'employeeID',
        'first_name',
        'last_name',
        'middle_name',
        'status',
        'branch_id',
        'title_id',
        'profile_image',
        'user_credentials_id',
    ];

    //protected $touches = ['userCredentials', 'roles', 'branch', 'title' ];

    public function userCredentials(): BelongsTo{
        return $this->belongsTo(UserCredentials::class, 'user_credentials_id', 'id');
    }

    //Functions for relationships
    public function enrollments(): HasMany{
        return $this->hasMany(Enrollment::class, 'user_id', 'id');
    }

    //TODO change name to be more clear, for knowing who made the enrollment
    public function enrollings(): HasMany{
        return $this->hasMany(Enrollment::class, 'enroller_id');
    }


    public function lessons(): BelongsToMany{
        return $this->belongsToMany(Lesson::class, 'learner_progress', 'userInfo_id', 'lesson_id')
            ->withPivot('is_completed', 'enrollment_id')
            ->withTimestamps();
    }

    public function getAttempt(int $userid, int $testid, int $number){
        return User_Test_Attempt::where('user_id', $userid)->where('test_id', $testid)
                        ->orderBy('created_at')
                        ->skip($number-1)
                        ->first();
    }

    public function tests(): BelongsToMany{
        return $this->belongsToMany(Test::class, 'user__test__attempts', 'user_id', 'test_id')->withPivot('is_completed', 'enrollment_id', 'score');
    }

    public function attempts(): HasMany{
        return $this->hasMany(User_Test_Attempt::class, 'user_id');
    }

    public function getAttemptCount($testId){
        return $this->attempts()->where('test_id', $testId)->count();
    }

    public function attachments(): BelongsToMany{
        return $this->belongsToMany(Attachment::class, 'learner_progress', 'userInfo_id', 'attachment_id')
            ->withPivot(['is_completed', 'enrollment_id'])
            ->withTimestamps();
    }

    // public function questions(): BelongsToMany{
    //     return $this->belongsToMany(Question::class, 'question_user_info', 'user_id', 'question_id')
    //         ->withPivot(['userAnswer', 'correct']);
    // }

    // public function questionsForTest($testId){
    //     return $this->question()->where('AssessmentID', $testId)->get();
    // }

    //MORE WORK
    public function certificates(): BelongsToMany{
        return $this->belongsToMany(Certificate::class, 'certificate_userinfos', 'user_id', 'certificate_id')
            ->withPivot(['date_finished', 'outside_certificate_url', 'external_certificate'])
            ->withTimestamps();
    }

    public function certificateRelation(): HasMany{
        return $this->hasMany(certificate_userinfo::class, 'user_id');
    }

    public function lessonsCompletedCount($courseId): int{
        return $this->lessons()->where('course_id', $courseId)->wherePivot('is_completed', true)->count();
    }

    public function completedModules($courseId,): int{
        // ?int $enrollment_id
        // if($enrollment_id){
        //     $lessons = $this->lessons()->where('course_id', $courseId)->wherePivot('is_completed', true)->wherePivot('enrollment_id', $enrollment_id)->count();
        //     $attachments = $this->attachments()->where('course_id', $courseId)->wherePivot('is_completed', true)->wherePivot('enrollment_id', $enrollment_id)->count();
        //     $test = $this->tests()->where('course_id', $courseId)->wherePivot('is_completed', true)->distinct('tests.id')->wherePivot('enrollment_id', $enrollment_id)->count('tests.id');
        // } else{
        // }
        $lessons = $this->lessons()->where('course_id', $courseId)->wherePivot('is_completed', true)->count();
        $attachments = $this->attachments()->where('course_id', $courseId)->wherePivot('is_completed', true)->count();
        $test = $this->tests()->where('course_id', $courseId)->wherePivot('is_completed', true)->distinct('tests.id')->count('tests.id');
        return $lessons + $attachments + $test;
    }

    public function passedTestCount(Course $course){
        $tests = $this->tests()->where('course_id', $course->id)
                            ->withMax(['attempts as highest_score'=>function($q){
                                $q->where('user_id', $this->id);
                            }], 'score')
                            ->get();

        $passedTest = $tests->unique('id')->filter(function($test){
            return $test->highest_score >= $test->passingScore();
        })
        ->count()
        ;
        return $passedTest;
    }

    public function moduleCompleted($courseId, ?int $enrollment_id): array{
        if($enrollment_id){
            $lessons = $this->lessons()
                ->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->wherePivot('enrollment_id', $enrollment_id)
                ->pluck('lesson_id')
                ->toArray();
            $attachments = $this->attachments()
                ->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->wherePivot('enrollment_id', $enrollment_id)
                ->pluck('attachment_id')
                ->toArray();
            $test = $this->tests()->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->wherePivot('enrollment_id', $enrollment_id)
                ->distinct()
                ->pluck('test_id')
                ->toArray();
        } else{
            $lessons = $this->lessons()
                ->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->pluck('lesson_id')
                ->toArray();
            $attachments = $this->attachments()
                ->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->pluck('attachment_id')
                ->toArray();
            $test = $this->tests()->where('course_id', $courseId)
                ->wherePivot('is_completed', true)
                ->distinct()
                ->pluck('test_id')
                ->toArray();
        }

        return array_merge($lessons, $attachments, $test);
    }

    public function statusEnrollings(){
        return $this->enrollings()->with('course')->get()->map(function ($enrollment){
            $courses = $enrollment->course;
            $courses->enrollment_status = $enrollment->enrollment_status;
            $courses->due_soon = $enrollment->due_soon;
            return $courses;
        });
    }

    public function addedCourses(): HasMany{
        return $this->hasMany(Course::class, 'system_admin_id');
    }

    public function assignedCourses(): BelongsToMany{
        return $this->belongsToMany(Course::class, 'course_userinfo_assignment', 'user_id', 'course_id')
            ->using(CourseUserAssigned::class)->withPivot('id');
    }

    public function roles(): BelongsToMany{
        return $this->belongsToMany(Role::class, 'role_userinfo', 'userinfo_id', 'role_id');
    }

    public function hasRole($role_name){
        return $this->roles()->where('role_name', $role_name)->exists();
    }

    public function permissions(): BelongsToMany{
        return $this->belongsToMany(Permission::class, 'permission_userinfo', 'userinfo_id', 'permission_id');
    }

    public function hasPermission($permission_name){
        return $this->permissions()->where('permission_name', $permission_name)->exists();
    }

    use \Staudenmeir\EloquentHasManyDeep\HasRelationships;
    public function permissionsRole():\Staudenmeir\EloquentHasManyDeep\HasManyDeep{
        return $this->hasManyDeepFromRelations($this->roles(), (new Role())->permissions());
    }

    public function branch(): BelongsTo{
        return $this->belongsTo(Branch::class);
    }

    use \Znck\Eloquent\Traits\BelongsToThrough;
    public function career_level(): BelongsToThrough{
        return $this->belongsToThrough(CareerLevel::class, Title::class);
    }

    public function title():BelongsTo{
        return $this->belongsTo(Title::class);
    }

    use \Znck\Eloquent\Traits\BelongsToThrough;
    public function city():BelongsToThrough{
        return $this->belongsToThrough(City::class, Branch::class);
    }

    use \Znck\Eloquent\Traits\BelongsToThrough;
    public function department(): BelongsToThrough
    {
        return $this->belongsToThrough(Department::class, Title::class);
    }


    public function enrolledCourses(): BelongsToMany{
        return $this->belongsToMany(Course::class, 'enrollments', 'user_id', 'course_id')
                        ->withPivot('id', 'enrollment_status', 'allow_late', 'due_soon', 'end_date', 'created_at', 'updated_at');
    }

    use \Znck\Eloquent\Traits\BelongsToThrough;
    public function division(): BelongsToThrough
    {
        return $this->belongsToThrough(
            Division::class,
            [Department::class, Title::class],
        );
    }
    public function profileImages(): HasMany{
        return $this->hasMany(ProfileImage::class, 'user_id', 'id');
    }

    public function createdCourses(): HasMany{
        return $this->hasMany(Course::class, 'author_id', 'id');
    }
    public function permittedSMEs()
    {
        return $this->hasMany(PermittedSME::class, 'PermittedID', 'id');
    }

    public function toSearchableArray()
    {
        $array = $this->toArray();
        $array['first_name'] = $this->first_name ?? null;
        $array['last_name'] = $this->last_name ?? null;
        $array['middle_name'] = $this->middle_name ?? null;
        $array['title_name'] = $this->title->title_name ?? null;;
        $array['department_name'] = $this->department->department_name ?? null;
        $array['division_name'] = $this->division->division_name ?? null;
        $array['branch_name'] = $this->branch->branch_name ?? null;
        $array['status'] = $this->status ?? null;
        $array['role_name'] = $this->roles->map(function ($data){
            return $data['role_name'];
        })->toArray();

        // Customize the array as needed
        return $array;
    }

    public function logs()
    {
        return $this->hasMany(UserLog::class, 'user_infos_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function selfEnrollmentRequests(): HasMany{
        return $this->hasMany(SelfEnrollmentRequest::class, 'user_id');
    }

    public function courseengagements():HasMany{
        return $this->hasMany(LearnerEngagement::class, 'user_id');
    }



    public function fullName() {
        $fullName = trim("{$this->first_name} " .
                            ("{$this->middle_name}" ? "{$this->middle_name}. " : "") .
                            "{$this->last_name} " );
        return $fullName;
    }
}

