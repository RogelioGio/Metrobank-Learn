<?php


namespace App\Models;


use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Scout\Searchable;

class UserCredentials extends Model implements Authenticatable
{
    use HasApiTokens,HasFactory, Searchable, Notifiable;

    /**
     * The table associated with the model.
     */
    protected $table = 'userCredentials'; // Replace with your actual table name
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $fillable = [
        'MBemail',
        'password',
        'last_logged_in',
        'user_info_id',
        'first_log_in',
        'phone_number',
    ];

    protected $hidden = [
        'password',
        'phone_number',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'first_log_in' => 'boolean',
            'phone_number' => 'encrypted',
        ];
    }

    //Abstract Functions
    public function getAuthIdentifierName()
    {
        return 'employeeID';  // Or 'id', depending on what your identifier column is
    }

    public function getAuthIdentifier()
    {
        return $this->employeeID;  // Use the employeeID as the unique identifier
    }

    public function getAuthPassword()
    {
        return $this->password;  // Return the password field
    }

    public function getRememberToken()
    {
        return null;  // Optional: You can implement this if you're using "remember me" functionality
    }

    public function setRememberToken($value)
    {
        // Optional: Implement if needed
    }

    public function getRememberTokenName()
    {
        return null;  // Optional: Implement if needed
    }

    public function getAuthPasswordName()
    {
        return null;
    }

    public function userInfos(): HasOne{
        return $this->hasOne(UserInfos::class, 'user_credentials_id');
    }

    use \Staudenmeir\EloquentHasManyDeep\HasRelationships;
    public function permissions(): \Staudenmeir\EloquentHasManyDeep\HasManyDeep{
        return $this->hasManyDeepFromRelations($this->userInfos(), (new UserInfos())->permissions());
    }

    public function roles(): \Staudenmeir\EloquentHasManyDeep\HasManyDeep{
        return $this->hasManyDeepFromRelations($this->userInfos(), (new UserInfos())->roles());
    }

    public function permissionsRole():\Staudenmeir\EloquentHasManyDeep\HasManyDeep{
        return $this->hasManyDeepFromRelations($this->roles(), (new Role())->permissions());
    }

    public function toSearchableArray(){
        $array = $this->toArray();
        $array['MBemail'] = $this->MBemail;
        $array['first_name'] = $this->userInfos->first_name ?? null;
        $array['last_name'] = $this->userInfos->last_name ?? null;

        return $array;
    }

    public function otp(){
        return $this->hasOne(UserOtp::class, 'user_credentials_id', 'id');
    }

    public function routeNotificationForMail($notification){
        return $this->MBemail;
    }
}
