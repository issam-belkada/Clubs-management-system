<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ressource;
class RessourceController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Ressource::paginate(10)], 200);
    }
    public function show($id)
    {
        $ressource = Ressource::find($id);
        if (!$ressource) {
            return response()->json(['message' => 'Ressource not found'], 404);
        }
        return response()->json(['data' => $ressource], 200);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|max:255',
            'cost'=>'nullable|numeric',
            'uploaded_by' => 'required|integer|exists:users,id'
        ]);
        $ressource = Ressource::create($request->all());
        return response()->json(['data' => $ressource], 201);
    }
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'title' => 'string|max:255|nullable',
            'description' => 'nullable|string',
            'type' => 'string|max:255|nullable',
            'cost' => 'numeric|nullable',
            'uploaded_by' => 'integer|nullable|exists:users,id'
        ]);
        $ressource = Ressource::find($id);
        if (!$ressource) {
            return response()->json(['message' => 'Ressource not found'], 404);
        }
        $ressource->update($request->all());
        return response()->json(['data' => $ressource], 200);
    }
    public function destroy($id)
    {
        $ressource = Ressource::find($id);
        if (!$ressource) {
            return response()->json(['message' => 'Ressource not found'], 404);
        }
        $ressource->delete();
        return response()->json(['message' => 'Ressource deleted successfully'], 200);
    }

}
