<?php

namespace App\Http\Controllers;

use App\Models\EventPost;
use Illuminate\Http\Request;
use App\Facades\Neo4j;
use App\Models\Event;
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

        // If user not authenticated, return trending events
        if (!$userId) {
            return $this->trending();
        }

        // Get clubs that the user follows
        $followedClubsResult = $this->neo4j->run(
            'MATCH (u:User {id: $userId})-[:FOLLOWS]->(c:Club)
             RETURN c.id as clubId',
            ['userId' => $userId]
        );

        $followedClubIds = [];
        foreach ($followedClubsResult->records() as $record) {
            $followedClubIds[] = $record->get('clubId');
        }

        // If user doesn't follow any clubs, return trending
        if (empty($followedClubIds)) {
            return $this->trending();
        }

        // Get events from followed clubs with engagement metrics
        $events = Event::whereIn('club_id', $followedClubIds)
            ->with(['posts' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }, 'club'])
            ->withCount('posts')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Enrich with engagement data from Neo4j
        foreach ($events as $event) {
            foreach ($event->posts as $post) {
                // Get likes count
                $likesResult = $this->neo4j->run(
                    'MATCH (u:User)-[:LIKES]->(p:EventPost {id: $postId})
                     RETURN COUNT(u) as count',
                    ['postId' => $post->id]
                );
                $post->likes_count = $likesResult->records()[0]?->get('count') ?? 0;

                // Get saves count
                $savesResult = $this->neo4j->run(
                    'MATCH (u:User)-[:SAVED]->(p:EventPost {id: $postId})
                     RETURN COUNT(u) as count',
                    ['postId' => $post->id]
                );
                $post->saves_count = $savesResult->records()[0]?->get('count') ?? 0;

                // Check if current user liked or saved
                $userLiked = $this->neo4j->run(
                    'MATCH (u:User {id: $userId})-[:LIKES]->(p:EventPost {id: $postId})
                     RETURN COUNT(*) as count',
                    ['userId' => $userId, 'postId' => $post->id]
                );
                $post->user_liked = $userLiked->records()[0]?->get('count') > 0;

                $userSaved = $this->neo4j->run(
                    'MATCH (u:User {id: $userId})-[:SAVED]->(p:EventPost {id: $postId})
                     RETURN COUNT(*) as count',
                    ['userId' => $userId, 'postId' => $post->id]
                );
                $post->user_saved = $userSaved->records()[0]?->get('count') > 0;
            }
        }

        return response()->json(['data' => $events], 200);
    }


    public function trending(Request $request)
    {
        // Get posts ranked by engagement (likes + saves + attendance)
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

        $postIds = [];
        foreach ($trendingResult->records() as $record) {
            $postIds[] = $record->get('postId');
        }

        // Get posts with event details
        if (empty($postIds)) {
            // If no posts exist, get trending events by attendance
            $trendingEvents = Event::withCount('attendances')
                ->orderBy('attendances_count', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json(['data' => $trendingEvents], 200);
        }

        // Fetch posts in trending order
        $posts = EventPost::with(['event' => function ($query) {
            $query->with('club');
        }])
        ->get()
        ->sortBy(function ($post) use ($postIds) {
            return array_search($post->id, $postIds);
        })
        ->values()
        ->paginate(10);

        // Enrich with engagement data
        $userId = $request->user()?->id;
        foreach ($posts as $post) {
            // Get likes count
            $likesResult = $this->neo4j->run(
                'MATCH (u:User)-[:LIKES]->(p:EventPost {id: $postId})
                 RETURN COUNT(u) as count',
                ['postId' => $post->id]
            );
            $post->likes_count = $likesResult->records()[0]?->get('count') ?? 0;

            // Get saves count
            $savesResult = $this->neo4j->run(
                'MATCH (u:User)-[:SAVED]->(p:EventPost {id: $postId})
                 RETURN COUNT(u) as count',
                ['postId' => $post->id]
            );
            $post->saves_count = $savesResult->records()[0]?->get('count') ?? 0;

            // Check if current user liked or saved (if authenticated)
            if ($userId) {
                $userLiked = $this->neo4j->run(
                    'MATCH (u:User {id: $userId})-[:LIKES]->(p:EventPost {id: $postId})
                     RETURN COUNT(*) as count',
                    ['userId' => $userId, 'postId' => $post->id]
                );
                $post->user_liked = $userLiked->records()[0]?->get('count') > 0;

                $userSaved = $this->neo4j->run(
                    'MATCH (u:User {id: $userId})-[:SAVED]->(p:EventPost {id: $postId})
                     RETURN COUNT(*) as count',
                    ['userId' => $userId, 'postId' => $post->id]
                );
                $post->user_saved = $userSaved->records()[0]?->get('count') > 0;
            }
        }

        return response()->json(['data' => $posts], 200);
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
            'post_title' => 'nullable|string|max:255',
            'post_description' => 'nullable|string|max:255',
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
            'post_title'=> 'sometimes|string|max:255',
            'post_description'=> 'sometimes|string|max:255',
            'post_image'=> 'sometimes|url',
            'post_image2'=> 'sometimes|url',
            'post_image3'=> 'sometimes|url',
            'post_image4'=> 'sometimes|url',
            'video_url'=> 'sometimes|url',
        ]);

        $eventPost->update($request->only([
            'content',
            'post_image',
            'post_title',
            'post_description',
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
