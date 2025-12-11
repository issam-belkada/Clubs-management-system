<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Club;
class ClubsContoller extends Controller
{
    public function index()
    {
        return response()->json(['data' => Club::paginate(10)], 200);
    }
    public function show($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        return response()->json(['data' => $club], 200);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'website_url' => 'nullable|string|max:255',
            'social_media_links' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'established_date' => 'nullable|date',
            'border_image' => 'nullable|string|max:255',
            'created_by' => 'required|integer|exists:users,id'
        ]);
        $club = Club::create($request->all());
        return response()->json(['data' => $club], 201);
    }
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|nullable',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'website_url' => 'nullable|string|max:255',
            'social_media_links' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'established_date' => 'nullable|date',
            'border_image' => 'nullable|string|max:255',
            'created_by' => 'required|integer|exists:users,id'
        ]);
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $club->update($request->all());
        return response()->json(['data' => $club], 200);
    }
    public function destroy($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $club->delete();
        return response()->json(['message' => 'Club deleted'], 200);
    }
    public function getClubEvents($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $events = $club->events()->paginate(10);
        return response()->json(['data' => $events], 200);
    }

}
