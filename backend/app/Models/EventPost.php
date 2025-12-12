<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventPost extends Model
{
    //
    protected $fillable = [
        'event_id',
        'content',
        "post_title",
        "post_description",
        'post_image',
        'post_image2',
        'post_image3',
        'post_image4',
        'post_video',
        'created_by'
    ];
    public function event(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
