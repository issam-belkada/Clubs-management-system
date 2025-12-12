<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
class AttendanceController extends Controller
{
    public function markAttendance(Request $request)
    {

        $validatedData = $request->validate([
            'event_id' => 'required|integer|exists:events,id',
            'user_id' => 'required|integer|exists:users,id',
            'status' => 'required|string|in:present,absent'
        ]);
        $attendance = Attendance::updateOrCreate(
            [
                'event_id' => $validatedData['event_id'],
                'user_id' => $validatedData['user_id']
            ],
            [
                'status' => $validatedData['status'],

            ]
        );
        return response()->json(['data' => $attendance], 200);
    }
    public function getAttendance($eventId)
    {
        $attendances = Attendance::where('event_id', $eventId)->get();
        return response()->json(['data' => $attendances], 200);
    }
    public function myAttendance(Request $request)
    {
        $userId = $request->user()->id;
        $attendances = Attendance::where('user_id', $userId)->get();
        return response()->json(['data' => $attendances], 200);
    }
}
