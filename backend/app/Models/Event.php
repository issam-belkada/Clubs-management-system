<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'location',
        'event_type_id',
        'max_participants',
        'club_id',
        'created_by',
        'status',
        'event_image',
        'custom_form'
    ];

    public function club(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Club::class);
    }
    public function posts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EventPost::class);
    }

    public function eventType()
{
    return $this->belongsTo(EventType::class, 'event_type_id');
}
}
