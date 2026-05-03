<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCategory extends Model
{
    protected $table = 'zconnect_categories';

    protected $fillable = ['CategoryName', 'CreatorName', 'CreatorID'];

    public function courses()
    {
        return $this->hasMany(ZCompELearnCourse::class, 'CategoryID');
    }


    public static function booted()
    {
        static::created(function($model) {
            self::logActivity('created', $model, [
                'new' => $model->toArray()
            ]);
        });

        static::updated(function($model) {
            self::logActivity('updated', $model, [
                'old' => $model->getOriginal(),
                'new' => $model->getChanges(),
            ]);
        });

        static::deleted(function($model) {
            self::logActivity('deleted', $model, [
                'old' => $model->getOriginal(),
            ]); 
        });
    }

    protected static function logActivity($action, $model, $changes = null)
    {
        $sessionId = ZCompELearnReports::where('user_id', auth()->id())
                            ->orderBy('login_at', 'desc')
                            ->value('session_id');
                            
        $activityLog = ZCompELearnActivityLogs::create([
            'user_id' => auth()->id(),
            'session_id' => $sessionId,
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'changes' => $changes,
        ]);
    }
}

