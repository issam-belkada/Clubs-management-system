<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventType;
class EventTypeController extends Controller
{
    public function index()
    {
        return response()->json(['data' => \App\Models\EventType::paginate(10)], 200);
    }
    public function show($id)
    {
        $eventType = EventType::find($id);
        if (!$eventType) {
            return response()->json(['message' => 'Event Type not found'], 404);
        }
        return response()->json(['data' => $eventType], 200);
    }
}
