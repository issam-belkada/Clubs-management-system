<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\Club;
use App\Facades\Neo4j;

class ProjectController extends Controller
{

    protected $neo4j;
    public function __construct()
    {
        // Inject Neo4j Aura client (configured via a ServiceProvider)
        $this->neo4j = app('neo4j');
    }
    
    public function index()
    {
        $projects = Project::all();
        return response()->json($projects);
    }

    public function store(Request $request)
{
    $authId = auth()->id();
    $club = Club::where('created_by', $authId)->first();

    if (!$club) {
        return response()->json(['message' => 'You do not own any club.'], 403);
    }

    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
    ]);

    $projectData = [
        'name' => $request->name,
        'description' => $request->description,
        'start_date' => $request->start_date,
        'end_date' => $request->end_date,
        'club_id' => $club->id,
        'created_by' => $authId,
    ];

    // Save in Eloquent
    $project = Project::create($projectData);

    return response()->json([
        'message' => 'Project created successfully!',
        'project' => $project,
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|in:not_started,in_progress,completed',
        ]);

        $project->update($request->only([
            'name',
            'description',
            'start_date',
            'end_date',
            'status'
        ]));

        $this->neo4j->run(
            'MATCH (p:Project {id: $id})
             SET p.name = $name,
                 p.description = $description,
                 p.start_date = $start_date,
                 p.end_date = $end_date,
                 p.status = $status',
            [
                'id' => (string) $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'status' => $project->status,
            ]
        );

        return response()->json([
            'message' => 'Project updated successfully!',
            'project' => $project,
        ]);
    }

    
    public function destroy($id)
    {
        $project = Project::find($id);
         $project->delete();
         $this->neo4j->run(
            'MATCH (p:Project {id: $id})
             DETACH DELETE p',
            ['id' => (string) $id]
        );
        return response()->json(['message' => 'Project deleted successfully']);
    }
}
