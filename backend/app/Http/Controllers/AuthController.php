<?php
namespace App\Http\Controllers;

use App\Facades\Neo4j;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    protected $neo4j;
    public function __construct()
    {
        // Inject Neo4j Aura client (configured via a ServiceProvider)
        $this->neo4j = app('neo4j');
    }
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $user->role = 'user';
        $user->save();

         try {

            $this->neo4j->run(
                'MERGE (u:User {id: $id})
                 SET u.name = $name, u.email = $email, u.created_at = $created_at',
                [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toDateTimeString(),
                ]
            );
        } catch (\Throwable $e) {
            // Log and continue — Postgres is authoritative; you can enqueue sync retry in production
           return response()->json([
                'message' => 'User created in primary database, but failed to create in Neo4j: '.$e->getMessage(),
                'user' => $user,
                'role' => $user->role,
            ], 201);
        }

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
        ], 201);
    }

    // Login (Issue Token)
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful!',
            'token' => $token,
            'user' => $user,
            'role' => $user->role,
        ]);
    }

    // Logout (Revoke Token)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully!',
        ]);
    }
}
