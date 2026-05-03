<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZCompELearnCalendarEvent extends Model
{
    protected $table = 'zconnect_calendar_events';

    protected $fillable = ['title', 'start', 'end'];

    public function setStartAttribute($value)
    {
        $this->attributes['start'] = (new \DateTime($value))->format('Y-m-d H:i:s');
    }

    public function setEndAttribute($value)
    {
        if ($value) {
            $this->attributes['end'] = (new \DateTime($value))->format('Y-m-d H:i:s');
        } else {
            $this->attributes['end'] = null;
        }
    }

}
