<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventType;
class EventsTypes extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = ['Workshop', 'Seminar', 'Social', 'Fundraiser', 'Competition', 'Networking', 'Webinar', 'Conference', 'Meetup', 'Hackathon'];

        foreach ($types as $type) {
            EventType::create(['name' => $type]);
        }

    }
}
