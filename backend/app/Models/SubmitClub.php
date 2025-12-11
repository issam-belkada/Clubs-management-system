<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubmitClub extends Model
{
    protected $fillable = [
        'club_id',
        'user_id',
        'submitted_at',
        'status',
        'form_data'
    ];
    public function club(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Club::class);
    }
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);   
    }
}
