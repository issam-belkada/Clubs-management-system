<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Project;
class TaskController extends Controller
{
    public function index($projectId)
    {
        $project = Project::find($projectId);
        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }
        $projectTasks = Task::where('project_id', $projectId)->get();
        return response()->json(['data' => $projectTasks], 200);
    }

    public function store(Request $request,$projectId)
    {
        $project = Project::find($projectId);
        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            "start_date" => 'nullable|date',
            "end_date" => 'nullable|date',
            'status' => 'required|string|in:pending,in_progress,completed',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'created_by' => 'required|integer|exists:users,id',
        ]);

        $task = Task::create($request->all());
        return response()->json(['data' => $task], 201);
    }

    public function show($id)
    {
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        return response()->json(['data' => $task], 200);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255|nullable',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            "start_date" => 'nullable|date',
            "end_date" => 'nullable|date',
            'status' => 'required|string|in:pending,in_progress,completed|nullable',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'created_by' => 'required|integer|exists:users,id',
        ]);
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        $task->update($request->all());
        return response()->json(['data' => $task], 200);
    }

    public function destroy($id)
    {
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully'], 200);
    }
    public function updateStatus(Request $request, $id)
    {
        $validatedData = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
        ]);
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        $task->status = $request->input('status');
        $task->save();
        return response()->json(['data' => $task], 200);
    }
    public function assign(Request $request, $id)
    {
        $validatedData = $request->validate([
            'assigned_to' => 'required|integer|exists:users,id',
        ]);
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
        $task->assigned_to = $request->input('assigned_to');
        $task->save();
        return response()->json(['data' => $task], 200);
    }
}
