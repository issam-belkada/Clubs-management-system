<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Submit;
class EventsController extends Controller
{
    protected $neo4j;
    public function __construct()
    {
         $this->neo4j = app('neo4j');
    }
    public function index()
    {
        return response()->json(['data' => Event::paginate(10)], 200);
    }
    public function show($id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        return response()->json(['data' => $event], 200);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required',
            'max_participants' => 'nullable|integer',
            'status' => 'in:scheduled,ongoing,completed,cancelled|default:scheduled',
            'location' => 'nullable|string|max:255',
            'event_type_id' => 'required|integer|exists:event_types,id',
            'club_id' => 'required|integer|exists:clubs,id',
            'created_by' => 'required|integer|exists:users,id',
            'custom_form' => 'nullable|json',
            'event_image' => 'nullable|string|max:255'
        ]);
        $event = Event::create($request->all());
        return response()->json(['data' => $event], 201);
    }
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255|nullable',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'max_participants' => 'nullable|integer',
            'status' => 'nullable|in:scheduled,ongoing,completed,cancelled',
            'end_time' => 'required',
            'location' => 'nullable|string|max:255',
            'event_type_id' => 'required|integer|exists:event_types,id',
            'club_id' => 'required|integer|exists:clubs,id',
            'created_by' => 'required|integer|exists:users,id',
            'custom_form' => 'nullable|json',
            'event_image' => 'nullable|string|max:255'
        ]);
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $event->update($request->all());
        return response()->json(['data' => $event], 200);
    }
    public function destroy($id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully'], 200);
    }

    public function attend(Request $request, $id)
    {
       $validatedData = $request->validate([
           'user_id' => 'required|integer|exists:users,id'
       ]);
       $event = Event::find($id);
       if (!$event) {
           return response()->json(['message' => 'Event not found'], 404);
       }
       Attendance::create([
           'event_id' => $id,
           'user_id' => $request->user_id,
           "status" => "present"
       ]);
         return response()->json(['message' => 'Attendance recorded'], 201);
    }
    public function attendees($id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $attendees = Attendance::where('event_id', $id)->get();
        return response()->json(['data' => $attendees], 200);
    }

    public function unattend(Request $request, $id)
    {
       $validatedData = $request->validate([
           'user_id' => 'required|integer|exists:users,id'
       ]);
       $event = Event::find($id);
       if (!$event) {
           return response()->json(['message' => 'Event not found'], 404);
       }
       $attendance = Attendance::where('event_id', $id)
                               ->where('user_id', $request->user_id)
                               ->first();
       if (!$attendance) {
           return response()->json(['message' => 'Attendance record not found'], 404);
       }
       $attendance->delete();
         return response()->json(['message' => 'Attendance removed'], 200);
    }
    public function submitForApproval(Request $request, $id)
    {
       $validate_data = $request->validate(
              [
                'user_id' => 'required|integer|exists:users,id',
                'form_data' => 'required|json'
              ]
              );
         $event = Event::find($id);
            if (!$event) {
                return response()->json(['message' => 'Event not found'], 404);
            }
        $submit = Submit::create([
                'event_id' => $id,
                'user_id' => $request->user_id,
                'submitted_at' => now(),
                'status' => 'pending',
                'form_data' => $request->form_data,
            ]);
            return response()->json(['data' => $submit], 201);

    }

}
