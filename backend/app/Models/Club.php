<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    //
    $fillable = [
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
    
}
