<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submit extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'submitted_at',
        'status',
        'form_data'
    ];
    public function event(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);   
    }
}
