<?php

namespace App\Http\Controllers;

use App\Models\EventPost;
use Illuminate\Http\Request;
use App\Facades\Neo4j;
use App\Models\Event;


class EventPostController extends Controller
{
    protected $neo4j;
    public function __construct()
    {
        // Inject Neo4j Aura client (configured via a ServiceProvider)
        $this->neo4j = app('neo4j');
    }

    public function feed()
    {
        //
    }


    public function trending()
    {
        //
    }

     public function index($eventId)
    {
        $event = Event::find($eventId);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $posts = EventPost::where('event_id', $eventId)->paginate(10);
        return response()->json(['data' => $posts,"event"=>$event], 200);
    }
    public function store(Request $request,$eventId)
    {
        $event = Event::find($eventId);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $validatedData = $request->validate([
            'content' => 'nullable|string',
            'post_image' => 'nullable|string|max:255',
            'post_image2' => 'nullable|string|max:255',
            'post_image3' => 'nullable|string|max:255',
            'post_image4' => 'nullable|string|max:255',
            'post_video' => 'nullable|string|max:255',
            'created_by' => 'required|integer|exists:users,id'
        ]);
        $data_to_create = $request->all();
        $data_to_create['event_id'] = $eventId;
        $post = EventPost::create($data_to_create);
        return response()->json(['data' => $post], 201);
    }


    public function show($id)
    {
        $eventPost = EventPost::find($id);
        if (!$eventPost) {
            return response()->json(['message' => 'Event post not found'], 404);
        }
        return response()->json($eventPost);
    }

    public function update(Request $request, $id)
    {
        $eventPost = EventPost::find($id);

        $request->validate([
            'content' => 'sometimes|string',
            'post_image'=> 'sometimes|url',
            'post_image2'=> 'sometimes|url',
            'post_image3'=> 'sometimes|url',
            'post_image4'=> 'sometimes|url',
            'video_url'=> 'sometimes|url',
        ]);

        $eventPost->update($request->only([
            'content',
            'post_image',
            'post_image2',
            'post_image3',
            'post_image4',
            'post_video'
        ]));

        return response()->json([
            'message' => 'Event post updated successfully!',
            'event_post' => $eventPost,
        ]);

    }


    public function destroy($id)
    {
        $eventPost = EventPost::find($id);

        $eventPost->delete();
        return response()->json(['message' => 'Event post deleted successfully']);
    }


    public function like($id)
    {
        $userId = auth()->id();

        $this->neo4j->run(
            'MATCH (u:User {id: $userId}), (p:EventPost {id: $postId})
             MERGE (u)-[:LIKES]->(p)',
            ['userId' => $userId, 'postId' => $id]
        );

        return response()->json(['message' => 'Post liked']);
    }


    public function unlike($id)
    {
        $userId = auth()->id();

        $this->neo4j->run(
            'MATCH (u:User {id: $userId})-[r:LIKES]->(p:EventPost {id: $postId})
             DELETE r',
            ['userId' => $userId, 'postId' => $id]
        );

        return response()->json(['message' => 'Like removed']);
    }

    public function save($id)
    {
        $userId = auth()->id();

        $this->neo4j->run(
            'MATCH (u:User {id: $userId}), (p:EventPost {id: $postId})
             MERGE (u)-[:SAVED]->(p)',
            ['userId' => $userId, 'postId' => $id]
        );

        return response()->json(['message' => 'Post saved']);
    }

    public function unsave($id)
    {
        $userId = auth()->id();

        $this->neo4j->run(
            'MATCH (u:User {id: $userId})-[r:SAVED]->(p:EventPost {id: $postId})
             DELETE r',
            ['userId' => $userId, 'postId' => $id]
        );

        return response()->json(['message' => 'Post unsaved']);
    }

    public function likes()
{
    $userId = auth()->id();

    $result = $this->neo4j->run(
        'MATCH (u:User {id: $userId})-[:LIKES]->(p:EventPost)
         RETURN p',
        ['userId' => $userId]
    );

    // Collect posts
    $posts = [];
    foreach ($result->records() as $record) {
        $posts[] = $record->get('p')->values(); // convert node to array
    }

    return response()->json($posts);
}
}
