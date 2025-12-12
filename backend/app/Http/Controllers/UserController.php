<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Facades\Neo4j;

class UserController extends Controller
{
    protected $neo4j;

    public function __construct()
    {
        $this->neo4j = app('neo4j');
    }


    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * Authenticated User Profile
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update Authenticated User Profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$user->id}",
        ]);

        $user->update($request->only(['name', 'email']));

        try {
            $this->neo4j->run(
                'MATCH (u:User {id: $id})
                 SET u.name = $name, u.email = $email',
                [
                    'id' => (int) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Profile updated in primary database, but failed to update in Neo4j: '.$e->getMessage(),
                'user' => $user,
            ], 200);
        }

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user,
        ]);
    }

}
