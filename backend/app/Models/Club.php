<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    //
    protected $fillable = [
        'name',
        'description',
        'logo_url',
        'contact_email',
        'website_url',
        'social_media_links',
        'location',
        'established_date',
        'border_image',
        'created_by'
    ];
    public function events(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Event::class);
    }
    public function ouner()
    {
        return $this->belongsTo(User::class, 'created_by');
    }    
}
