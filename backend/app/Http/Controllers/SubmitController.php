<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubmitClub;
use App\Models\Submit;
use Illuminate\Support\Facades\Auth;


class SubmitController extends Controller
{
    public function pendingEvents(Request $request)
    {
        $clubSubmissions = SubmitClub::where('user_id', Auth::user()->id)->get();
        $eventSubmissions = Submit::where('user_id', Auth::user()->id)->get();

        return response()->json([
            'club_submissions' => $clubSubmissions,
            'event_submissions' => $eventSubmissions
        ], 200);
    }
    public function submitEvent(Request $request, $eventId, $userId)
    {
        $validatedData = $request->validate([
            'form_data' => 'required|array',
        ]);

        $submission = Submit::create([
            'event_id' => $eventId,
            'user_id' => $userId,
            'submitted_at' => now(),
            'status' => 'pending',
            'form_data' => json_encode($validatedData['form_data']),
        ]);

        return response()->json(['data' => $submission], 201);
    }
    public function cancleEventSubmission(Request $request, $submissionId, $userId)
    {
        $submission = Submit::where('id', $submissionId)->where('user_id', $userId)->first();
        if (!$submission) {
            return response()->json(['message' => 'Submission not found'], 404);
        }
        $submission->delete();
        return response()->json(['message' => 'Submission cancelled successfully'], 200);
    }
    public function pendingClubs(Request $request)
    {
        $clubSubmissions = SubmitClub::where('user_id', Auth::user()->id)->get();

        return response()->json([
            'club_submissions' => $clubSubmissions
        ], 200);
    }
    public function submitClub(Request $request)
    {
        $userId = Auth::user()->id;

        $validatedData = $request->validate([
            'form_data' => 'required|array',
            'club_id' => 'required|exists:clubs,id',
        ]);
        $submission = SubmitClub::create([
            'club_id' => $validatedData['club_id'],
            'user_id' => $userId,
            'submitted_at' => now(),
            'status' => 'pending',
            'form_data' => json_encode($validatedData['form_data']),
        ]);
        return response()->json(['data' => $submission], 201);
    }
    public function reviewClub(Request $request, $submissionId)
    {
        $validatedData = $request->validate([
            'status' => 'required|string|in:approved,rejected',
        ]);

        $submission = SubmitClub::find($submissionId);
        if (!$submission) {
            return response()->json(['message' => 'Submission not found'], 404);
        }

        $submission->status = $validatedData['status'];
        $submission->save();

        return response()->json(['data' => $submission], 200);
    }
}
