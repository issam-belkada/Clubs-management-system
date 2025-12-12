<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClubsController;
use App\Http\Controllers\EventPostController;
use App\Http\Controllers\EventsControllers;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\EventTypeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubmitController;
use App\Http\Controllers\SubmitClubController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DiscoverController;
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
 });
 Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'updateProfile']);
    Route::get('/{user}', [UserController::class, 'show']);
});


Route::prefix('clubs')->group(function () {
    Route::get('/', [ClubsController::class, 'index']);
    Route::post('/', [ClubsController::class, 'store'])->middleware('auth:sanctum');

    Route::prefix('{club}')->group(function () {
        Route::get('/', [ClubsController::class, 'show']);
        Route::put('/', [ClubsController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [ClubsController::class, 'destroy'])->middleware('auth:sanctum');

        // Club Members
        Route::get('/members', [ClubsController::class, 'members']);
        Route::post('/members', [ClubsController::class, 'addMember'])->middleware('auth:sanctum');
        Route::put('/members/{user}', [ClubsController::class, 'updateMemberRole'])->middleware('auth:sanctum');
        Route::delete('/members/{user}', [ClubsController::class, 'removeMember'])->middleware('auth:sanctum');
        Route::post('/follow', [ClubsController::class, 'follow'])->middleware('auth:sanctum');
        Route::delete('/unfollow', [ClubsController::class, 'unfollow'])->middleware('auth:sanctum');
        // Club Resources
        Route::get('/resources', [ResourceController::class, 'index']);
        Route::post('/resources', [ResourceController::class, 'store'])->middleware('auth:sanctum');
        Route::get('/search', [ClubsController::class, 'search']);
        // Club Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [ProjectController::class, 'store'])->middleware('auth:sanctum');

        // Club Events
        Route::get('/events', [EventsController::class, 'clubEvents']);
    });
});


Route::prefix('events')->group(function () {
    Route::get('/', [EventsController::class, 'index']);
    Route::post('/', [EventsController::class, 'store'])->middleware('auth:sanctum');

    Route::prefix('{event}')->group(function () {
        Route::get('/', [EventsController::class, 'show']);
        Route::put('/', [EventsController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [EventsController::class, 'destroy'])->middleware('auth:sanctum');

        // Event Participation
        Route::post('/attend', [EventsController::class, 'attend'])->middleware('auth:sanctum');
        Route::delete('/attend', [EventsController::class, 'unattend'])->middleware('auth:sanctum');
        Route::get('/attendees', [EventsController::class, 'attendees']);
        Route::post('/submit', [EventsController::class, 'submitForApproval'])->middleware('auth:sanctum');
        Route::get('/submissions', [EventsController::class, 'mySubmissions'])->middleware('auth:sanctum');
        Route::put('/submissions/{submission}', [EventsController::class, 'reviewSubmission'])->middleware('auth:sanctum')->middleware('can:review submissions');

        // Event Posts (Social Feed)
        Route::get('/posts', [EventPostController::class, 'index']);
        Route::post('/posts', [EventPostController::class, 'store'])->middleware('auth:sanctum');
    });
});


Route::prefix('event-posts')->group(function () {
    Route::get('/', [EventPostController::class, 'feed']); // Main feed
    Route::get('/trending', [EventPostController::class, 'trending']);

    Route::prefix('{eventPost}')->group(function () {
        Route::get('/', [EventPostController::class, 'show']);
        Route::put('/', [EventPostController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [EventPostController::class, 'destroy'])->middleware('auth:sanctum');

        // Interactions
        Route::post('/like', [EventPostController::class, 'like'])->middleware('auth:sanctum');
        Route::delete('/like', [EventPostController::class, 'unlike'])->middleware('auth:sanctum');
        Route::post('/save', [EventPostController::class, 'save'])->middleware('auth:sanctum');
        Route::delete('/save', [EventPostController::class, 'unsave'])->middleware('auth:sanctum');

    });
    Route::get( '/likes', [EventPostController::class, 'likes'])
});



Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::post('/', [ProjectController::class, 'store'])->middleware('auth:sanctum');

    Route::prefix('{project}')->group(function () {
        Route::get('/', [ProjectController::class, 'show']);
        Route::put('/', [ProjectController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [ProjectController::class, 'destroy'])->middleware('auth:sanctum');

        // Project Tasks
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store'])->middleware('auth:sanctum');
    });
});


Route::prefix('tasks')->middleware('auth:sanctum')->group(function () {

    Route::prefix('{task}')->group(function () {
        Route::get('/', [TaskController::class, 'show']);
        Route::put('/', [TaskController::class, 'update']);
        Route::delete('/', [TaskController::class, 'destroy']);
        Route::put('/status', [TaskController::class, 'updateStatus']);
        Route::put('/assign', [TaskController::class, 'assign']);
    });
});

Route::prefix('resources')->group(function () {
    Route::get('/', [ResourceController::class, 'index']);
    Route::post('/', [ResourceController::class, 'store'])->middleware('auth:sanctum');

    Route::prefix('{resource}')->group(function () {
        Route::get('/', [ResourceController::class, 'show']);

        Route::put('/', [ResourceController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [ResourceController::class, 'destroy'])->middleware('auth:sanctum');
    });
});

Route::prefix('event-types')->middleware(['auth:sanctum', 'can:manage event_types'])->group(function () {
    Route::get('/', [EventTypeController::class, 'index']);
    Route::prefix('{eventType}')->group(function () {
        Route::get('/', [EventTypeController::class, 'show']);
    });
});


// Soumission d'événements pour approbation
Route::prefix('submissions')->middleware('auth:sanctum')->group(function () {
    Route::get('/events', [SubmitController::class, 'pendingEvents']);
    Route::post('/events', [SubmitController::class, 'submitEvent']);
    Route::delete('/events/{event}', [SubmitController::class, 'cancleEventSubmission']);

    Route::get('/clubs', [SubmitClubController::class, 'pendingClubs']);
    Route::post('/clubs', [SubmitClubController::class, 'submitClub']);
    Route::put('/clubs/{submisionId}', [SubmitClubController::class, 'reviewClub'])->middleware('can:review clubs');
});

Route::prefix('attendance')->middleware('auth:sanctum')->group(function () {
    // Pour les organisateurs/club admins
    Route::post('/events/{event}/mark', [AttendanceController::class, 'markAttendance'])->middleware('can:mark attendance');
    Route::get('/events/{event}/report', [AttendanceController::class, 'getAttendance'])->middleware('can:view attendance');

    // Pour les utilisateurs
    Route::get('/my-attendance', [AttendanceController::class, 'myAttendance']);
});


Route::prefix('discover')->group(function () {
    Route::get('/events', [DiscoverController::class, 'events']);
    Route::get('/clubs', [DiscoverController::class, 'clubs']);
    Route::get('/recommended', [DiscoverController::class, 'recommended'])->middleware('auth:sanctum');
    Route::get('/trending', [DiscoverController::class, 'trending']);
});
