<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'location',
        'event_type_id',
        'club_id',
        'created_by',
        'custom_form',
        'event_image'
    ];
}
