<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\EventPostController;
use App\Http\Controllers\EventsController;
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
    Route::get('/{user}', [UserController::class, 'show'])->middleware('can:view users');
    Route::get('/all', [UserController::class, 'index'])->middleware('can:view users');
});



Route::prefix('clubs')->group(function () {
    Route::get('/', [ClubController::class, 'index']);
    Route::post('/', [ClubController::class, 'store'])->middleware(['auth:sanctum', 'can:create clubs']);

    Route::prefix('{club}')->group(function () {
        Route::get('/', [ClubController::class, 'show']);
        Route::put('/', [ClubController::class, 'update'])->middleware(['auth:sanctum', 'can:edit clubs']);
        Route::delete('/', [ClubController::class, 'destroy'])->middleware(['auth:sanctum', 'can:delete clubs']);

        // Club Members
        Route::get('/members', [ClubController::class, 'members'])->middleware(["auth:sanctum",'can:see members']);
        Route::post('/members', [ClubController::class, 'addMember'])->middleware(['auth:sanctum', 'can:accept members']);
        Route::put('/members/{user}', [ClubController::class, 'updateMemberRole'])->middleware(['auth:sanctum', 'can:assign roles']);
        Route::delete('/members/{user}', [ClubController::class, 'removeMember'])->middleware(['auth:sanctum', 'can:remove members']);
        Route::post('/follow', [ClubController::class, 'follow'])->middleware('auth:sanctum');
        Route::delete('/unfollow', [ClubController::class, 'unfollow'])->middleware('auth:sanctum');
        // Club Resources
        Route::get('/resources', [ResourceController::class, 'index']);
        Route::post('/resources', [ResourceController::class, 'store'])->middleware(['auth:sanctum', 'can:create resources']);
        Route::get('/search', [ClubController::class, 'search']);
        // Club Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [ProjectController::class, 'store'])->middleware(['auth:sanctum', 'can:create projects']);

        // Club Events
        Route::get('/events', [EventsController::class, 'clubEvents']);
    });
});


Route::prefix('events')->group(function () {
    Route::get('/', [EventsController::class, 'index']);
    Route::post('/', [EventsController::class, 'store'])->middleware(['auth:sanctum', 'can:create events']);

    Route::prefix('{event}')->group(function () {
        Route::get('/', [EventsController::class, 'show']);
        Route::put('/', [EventsController::class, 'update'])->middleware(['auth:sanctum', 'can:edit events']);
        Route::delete('/', [EventsController::class, 'destroy'])->middleware(['auth:sanctum', 'can:delete events']);

        // Event Participation
        Route::post('/attend', [EventsController::class, 'attend'])->middleware('auth:sanctum');
        Route::delete('/attend', [EventsController::class, 'unattend'])->middleware('auth:sanctum');
        Route::get('/attendees', [EventsController::class, 'attendees']);
        Route::post('/submit', [EventsController::class, 'submitForApproval'])->middleware('auth:sanctum');
        Route::get('/submissions', [EventsController::class, 'mySubmissions'])->middleware('auth:sanctum');
        Route::put('/submissions/{submission}', [EventsController::class, 'reviewSubmission'])->middleware(['auth:sanctum', 'can:review event submissions']);

        // Event Posts (Social Feed)
        Route::get('/posts', [EventPostController::class, 'index']);
        Route::post('/posts', [EventPostController::class, 'store'])->middleware(['auth:sanctum', 'can:create posts']);
    });
});


Route::prefix('event-posts')->group(function () {
    Route::get('/', [EventPostController::class, 'feed']); // Main feed
    Route::get('/trending', [EventPostController::class, 'trending']);

    Route::prefix('{eventPost}')->group(function () {
        Route::get('/', [EventPostController::class, 'show']);
        Route::put('/', [EventPostController::class, 'update'])->middleware(['auth:sanctum', 'can:edit posts']);
        Route::delete('/', [EventPostController::class, 'destroy'])->middleware(['auth:sanctum', 'can:delete posts']);

        // Interactions
        Route::post('/like', [EventPostController::class, 'like'])->middleware('auth:sanctum');
        Route::delete('/like', [EventPostController::class, 'unlike'])->middleware('auth:sanctum');
        Route::post('/save', [EventPostController::class, 'save'])->middleware('auth:sanctum');
        Route::delete('/save', [EventPostController::class, 'unsave'])->middleware('auth:sanctum');

    });
    Route::get('/likes', [EventPostController::class, 'likes']);
});



Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::post('/', [ProjectController::class, 'store'])->middleware(['auth:sanctum', 'can:create projects']);

    Route::prefix('{project}')->group(function () {
        Route::get('/', [ProjectController::class, 'show']);
        Route::put('/', [ProjectController::class, 'update'])->middleware(['auth:sanctum', 'can:edit projects']);
        Route::delete('/', [ProjectController::class, 'destroy'])->middleware(['auth:sanctum', 'can:delete projects']);

        // Project Tasks
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store'])->middleware(['auth:sanctum', 'can:create tasks']);
    });
});


Route::prefix('tasks')->middleware('auth:sanctum')->group(function () {

    Route::prefix('{task}')->group(function () {
        Route::get('/', [TaskController::class, 'show']);
        Route::put('/', [TaskController::class, 'update'])->middleware('can:edit tasks');
        Route::delete('/', [TaskController::class, 'destroy'])->middleware('can:delete tasks');
        Route::put('/status', [TaskController::class, 'updateStatus'])->middleware('can:edit tasks');
        Route::put('/assign', [TaskController::class, 'assign'])->middleware('can:edit tasks');
    });
});

Route::prefix('resources')->group(function () {
    Route::get('/', [ResourceController::class, 'index']);
    Route::post('/', [ResourceController::class, 'store'])->middleware(['auth:sanctum', 'can:create resources']);

    Route::prefix('{resource}')->group(function () {
        Route::get('/', [ResourceController::class, 'show']);

        Route::put('/', [ResourceController::class, 'update'])->middleware(['auth:sanctum', 'can:edit resources']);
        Route::delete('/', [ResourceController::class, 'destroy'])->middleware(['auth:sanctum', 'can:delete resources']);
    });
});

Route::prefix('event-types')->middleware('auth:sanctum')->group(function () {
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

    Route::get('/clubs', [SubmitController::class, 'pendingClubs']);
    Route::post('/clubs', [SubmitController::class, 'submitClub']);
    Route::put('/clubs/{submisionId}', [SubmitController::class, 'reviewClub'])->middleware('can:review club submissions');
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
