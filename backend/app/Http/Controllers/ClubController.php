<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Club;
use App\Models\SubmitClub;
use App\Models\User;
class ClubController extends Controller
{
    protected $neo4j;
    public function __construct()
    {
        $this->neo4j = app('neo4j');
    }
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
        $createdByUser = User::find($request->input('created_by'));
        if ($createdByUser) {
            $createdByUser->role = 'club_admin';
            $createdByUser->save();
        }
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
    public function search(Request $request)
    {
        $query = Club::query();
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->input('location') . '%');
        }
        $clubs = $query->paginate(10);
        return response()->json(['data' => $clubs], 200);
    }

    public function members($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $successful_submittion = SubmitClub::where('club_id',$id)->where('status','approved')->pluck('user_id')->toArray();
        $members =  User::whereIn('id',$successful_submittion)->get();
        return response()->json(['data' => $members], 200);
    }
    public function addMember(Request $request, $id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $validatedData = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);
        $existingSubmit = SubmitClub::where('club_id', $id)
            ->where('user_id', $request->input('user_id'))
            ->first();
        if ($existingSubmit) {
            return response()->json(['message' => 'User has already submitted a request to join this club'], 400);
        }
        $submit = SubmitClub::create([
            'club_id' => $id,
            'user_id' => $request->input('user_id'),
            'submitted_at' => now(),
            'status' => 'approved',
            'form_data' => json_encode([]),
        ]);
        User::find($request->input('user_id'))->role='club_member';
        return response()->json(['data' => $submit], 201);
    }
    public function removeMember($clubId, $userId)
    {
        $club = Club::find($clubId);
        if (!$club) {
            return response()->json(['message' => 'Club not found'], 404);
        }
        $submit = SubmitClub::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->first();
        if (!$submit || $submit->status !== 'approved') {
            return response()->json(['message' => 'User is not a member of this club'], 400);
        }
        $submit->delete();
        return response()->json(['message' => 'Member removed from club'], 200);
    }
    public function updateMemberRole(Request $request, $clubId, $userId)
    {
        // This function can be implemented to update member roles within the club
        return response()->json(['message' => 'Not implemented'], 501);
    }

    public function follow(Request $request, $clubId)
    {

        $req  = $this->neo4j->run(
            'MATCH (u:User {id: $userId}), (c:Club {id: $clubId})
             MERGE (u)-[:FOLLOWS]->(c)',
            [
                'userId' => $request->user()->id,
                'clubId' => (int)$clubId
            ]
        );
        if($req->getRecords()==null){
            return response()->json(['message' => 'Club or User not found'], 404);
        }

        return response()->json(['message' => 'follwed the club'], 200);
    }
    public function unfollow(Request $request, $clubId)
    {
        $req = $this->neo4j->run(
            'MATCH (u:User {id: $userId})-[f:FOLLOWS]->(c:Club {id: $clubId})
             DELETE f',
            [
                'userId' => $request->user()->id,
                'clubId' => (int)$clubId
            ]
        );
        if($req->getRecords()==null){
            return response()->json(['message' => 'Club or User not found'], 404);
        }
        return response()->json(['message' => 'unfollowed'], 200);
    }
    public function submissions($clubId)
    {
        $submissions = SubmitClub::where('club_id', $clubId)->get();
        return response()->json(['data' => $submissions], 200);
    }
    public function reviewSubmission(Request $request, $clubId, $submissionId)
    {
        $validatedData = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);
        $submission = SubmitClub::where('club_id', $clubId)
            ->where('id', $submissionId)
            ->first();
        if (!$submission) {
            return response()->json(['message' => 'Submission not found'], 404);
        }
        $submission->status = $validatedData['status'];
        $submission->save();
        return response()->json(['data' => $submission], 200);
    }

}
