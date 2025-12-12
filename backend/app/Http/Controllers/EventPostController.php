<?php

namespace App\Http\Controllers;

use App\Models\EventPost;
use Illuminate\Http\Request;
use App\Facades\Neo4j;
use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class EventPostController extends Controller
{
    protected $neo4j;
    public function __construct()
    {
        // Inject Neo4j Aura client (configured via a ServiceProvider)
        $this->neo4j = app('neo4j');
    }

public function feed(Request $request)
{
    $userId = Auth::user()?->id;

    if (!$userId) {
        // Top 20 trending posts ordered by Neo4j likes count
        $trendingQuery = $this->neo4j->run(
            'MATCH (p:EventPost)
             OPTIONAL MATCH (u:User)-[:LIKES]->(p)
             WITH p, COUNT(u) AS likesCount
             RETURN p {.*, likes_count: likesCount} AS post
             ORDER BY likesCount DESC
             LIMIT 20'
        );

        $trendingPosts = [];

        foreach ($trendingQuery as $record) {
            $trendingPosts[] = $record->get('post');
        }

        return response()->json([
            "status" => "success",
            "type" => "trending",
            "data" => $trendingPosts
        ], 200);
    }

    $followedClubsResult = $this->neo4j->run(
        'MATCH (u:User {id: $userId})-[:FOLLOWS]->(c:Club)
         RETURN c.id AS clubId',
        ['userId' => $userId]
    );

    $followedClubIds = [];
    foreach ($followedClubsResult as $record) {
        $followedClubIds[] = $record->get('clubId');
    }

 
    if (count($followedClubIds) === 0) {
        $fallbackTrending = $this->neo4j->run(
            'MATCH (p:EventPost)
             OPTIONAL MATCH (u:User)-[:LIKES]->(p)
             WITH p, COUNT(u) AS likesCount
             RETURN p {.*, likes_count: likesCount} AS post
             ORDER BY likesCount DESC
             LIMIT 20'
        );

        $posts = [];
        foreach ($fallbackTrending as $record) {
            $posts[] = $record->get('post');
        }

        return response()->json([
            "status" => "success",
            "type" => "trending_fallback",
            "data" => $posts
        ], 200);
    }


    $events = Event::whereIn('club_id', $followedClubIds)
        ->with(['posts' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }, 'club'])
        ->withCount('posts')
        ->orderBy('created_at', 'desc')
        ->paginate(10);

    /** Add likes, saves, userLiked, userSaved (Neo4j) */
    foreach ($events as $event) {
        foreach ($event->posts as $post) {

            // Likes count
            $likes = $this->neo4j->run(
                'MATCH (u:User)-[:LIKES]->(p:EventPost {id: $postId})
                 RETURN COUNT(u) AS count',
                ['postId' => $post->id]
            );
            $post->likes_count = $likes->records()[0]?->get('count') ?? 0;

            // Saves count
            $saves = $this->neo4j->run(
                'MATCH (u:User)-[:SAVED]->(p:EventPost {id: $postId})
                 RETURN COUNT(u) AS count',
                ['postId' => $post->id]
            );
            $post->saves_count = $saves->records()[0]?->get('count') ?? 0;

            // Whether current user liked
            $userLiked = $this->neo4j->run(
                'MATCH (u:User {id: $userId})-[:LIKES]->(p:EventPost {id: $postId})
                 RETURN COUNT(*) AS count',
                ['userId' => $userId, 'postId' => $post->id]
            );
            $post->user_liked = $userLiked->records()[0]?->get('count') > 0;
            // Whether current user saved
            $userSaved = $this->neo4j->run(
                'MATCH (u:User {id: $userId})-[:SAVED]->(p:EventPost {id: $postId})
                 RETURN COUNT(*) AS count',
                ['userId' => $userId, 'postId' => $post->id]
            );
            $post->user_saved = $userSaved->records()[0]?->get('count') > 0;
        }
    }

    return response()->json([
        "status" => "success",
        "type" => "feed",
        "data" => $events
    ], 200);
}
public function trending(Request $request)
{
    // Query Neo4j for trending posts based on engagement
    $trendingResult = $this->neo4j->run(
        'MATCH (p:EventPost)
         OPTIONAL MATCH (u:User)-[:LIKES]->(p)
         WITH p, COUNT(u) as likes_count
         OPTIONAL MATCH (u2:User)-[:SAVED]->(p)
         WITH p, likes_count, COUNT(u2) as saves_count
         WITH p, likes_count, saves_count, (likes_count + saves_count) as engagement
         ORDER BY engagement DESC, p.created_at DESC
         LIMIT 100
         RETURN p.id as postId, engagement'
    );

    // Collect post IDs from Neo4j result
    $postIds = [];
    foreach ($trendingResult as $record) {
        $postIds[] = $record->get('postId');
    }

    // If no posts exist, fall back to trending events by attendance
    if (empty($postIds)) {
        $trendingEvents = Event::withCount('attendances')
            ->orderBy('attendances_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['data' => $trendingEvents], 200);
    }

    // Fetch posts with their event + club relation
    $posts = EventPost::with(['event' => function ($query) {
            $query->with('club');
        }])
        ->whereIn('id', $postIds)
        ->get()
        ->sortBy(function ($post) use ($postIds) {
            return array_search($post->id, $postIds);
        })
        ->values();

    // Manual Pagination
    $currentPage = LengthAwarePaginator::resolveCurrentPage();
    $perPage = 10;
    $paged = new LengthAwarePaginator(
        $posts->forPage($currentPage, $perPage),
        $posts->count(),
        $perPage,
        $currentPage,
        ['path' => request()->url(), 'query' => request()->query()]
    );

    // Add engagement data (likes, saves, user interactions)
    $userId = $request->user()?->id;

    foreach ($paged as $post) {
        // Likes count
        $likesResult = $this->neo4j->run(
            'MATCH (u:User)-[:LIKES]->(p:EventPost {id: $postId})
             RETURN COUNT(u) as count',
            ['postId' => $post->id]
        );
        $post->likes_count = $likesResult->first()->get('count') ?? 0;

        // Saves count
        $savesResult = $this->neo4j->run(
            'MATCH (u:User)-[:SAVED]->(p:EventPost {id: $postId})
             RETURN COUNT(u) as count',
            ['postId' => $post->id]
        );
        $post->saves_count = $savesResult->first()->get('count') ?? 0;

        // If logged in, check user interactions
        if ($userId) {
            $userLiked = $this->neo4j->run(
                'MATCH (u:User {id: $userId})-[:LIKES]->(p:EventPost {id: $postId})
                 RETURN COUNT(*) as count',
                ['userId' => $userId, 'postId' => $post->id]
            );
            $post->user_liked = $userLiked->first()->get('count') > 0;

            $userSaved = $this->neo4j->run(
                'MATCH (u:User {id: $userId})-[:SAVED]->(p:EventPost {id: $postId})
                 RETURN COUNT(*) as count',
                ['userId' => $userId, 'postId' => $post->id]
            );
            $post->user_saved = $userSaved->first()->get('count') > 0;
        }
    }

    return response()->json(['data' => $paged], 200);
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
    public function store(Request $request, $eventId)
{
    $event = Event::with('eventType')->find($eventId);

    if (!$event) {
        return response()->json(['message' => 'Event not found'], 404);
    }

    // Validate request
    $validated = $request->validate([
        'content' => 'nullable|string',
        'post_title' => 'nullable|string|max:255',
        'post_description' => 'nullable|string|max:255',
        'post_image' => 'nullable|string|max:255',
        'post_image2' => 'nullable|string|max:255',
        'post_image3' => 'nullable|string|max:255',
        'post_image4' => 'nullable|string|max:255',
        'post_video' => 'nullable|string|max:255',
    ]);

    $validated['event_id'] = $eventId;
    $validated['created_by'] = auth()->id();

    // Save inside MySQL
    $post = EventPost::create($validated);

    // Event type name
    $eventTypeName = $event->eventType?->name ?? 'Unknown';

    // Prepare Neo4j properties
    $neo4jData = [
        'content' => $post->content,
        'post_title' => $post->post_title,
        'post_description' => $post->post_description,
        'post_image' => $post->post_image,
        'post_image2' => $post->post_image2,
        'post_image3' => $post->post_image3,
        'post_image4' => $post->post_image4,
        'post_video' => $post->post_video,
        'created_by' => $post->created_by,
        'event_id' => (int) $eventId,
        'event_type_name' => $eventTypeName,
    ];

    // Neo4j: MERGE everything safely
    $this->neo4j->run(
        '
        MERGE (u:User {id: $userId})
        MERGE (e:Event {id: $eventId})
        MERGE (t:EventType {name: $eventTypeName})

        MERGE (p:EventPost {id: $postId})
        SET p += $postData

        MERGE (p)-[:BELONGS_TO_TYPE]->(t)
        MERGE (u)-[:CREATED]->(p)
        MERGE (e)-[:HAS_POST]->(p)

        RETURN p, t, u, e
        ',
        [
            'userId' => auth()->id(),
            'eventId' => (int) $eventId,
            'eventTypeName' => $eventTypeName,
            'postId' => (int) $post->id,
            'postData' => $neo4jData,
        ]
    );

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

    if (!$eventPost) {
        return response()->json(['message' => 'Event post not found'], 404);
    }

    $validatedData = $request->validate([
        'content' => 'sometimes|string',
        'post_title'=> 'sometimes|string|max:255',
        'post_description'=> 'sometimes|string|max:255',
        'post_image'=> 'sometimes|string|max:255',
        'post_image2'=> 'sometimes|string|max:255',
        'post_image3'=> 'sometimes|string|max:255',
        'post_image4'=> 'sometimes|string|max:255',
        'post_video'=> 'sometimes|string|max:255',
    ]);

    // Update MySQL
    $eventPost->update($validatedData);

    // Update in Neo4j
    $this->neo4j->run(
        'MATCH (p:EventPost {id: $id})
         SET p += $fields
         RETURN p',
        [
            'id' => $id,
            'fields' => $validatedData
        ]
    );

    return response()->json([
        'message' => 'Event post updated successfully!',
        'event_post' => $eventPost,
    ]);
}



    public function destroy($id)
{
    $eventPost = EventPost::find($id);

    if (!$eventPost) {
        return response()->json(['message' => 'Event post not found'], 404);
    }

    // Delete MySQL
    $eventPost->delete();

    // Delete Neo4j node
    $this->neo4j->run(
        'MATCH (p:EventPost {id: $id})
         DETACH DELETE p',
        ['id' => $id]
    );

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
