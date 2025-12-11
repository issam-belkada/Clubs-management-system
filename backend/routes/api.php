<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
    Route::get('/', [ClubController::class, 'index']);
    Route::post('/', [ClubController::class, 'store'])->middleware('auth:sanctum');
    
    Route::prefix('{club}')->group(function () {
        Route::get('/', [ClubController::class, 'show']);
        Route::put('/', [ClubController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [ClubController::class, 'destroy'])->middleware('auth:sanctum');
        
        // Club Members
        Route::get('/members', [ClubController::class, 'members']);
        Route::post('/members', [ClubController::class, 'addMember'])->middleware('auth:sanctum');
        Route::put('/members/{user}', [ClubController::class, 'updateMemberRole'])->middleware('auth:sanctum');
        Route::delete('/members/{user}', [ClubController::class, 'removeMember'])->middleware('auth:sanctum');
        Route::post('/follow', [ClubController::class, 'follow'])->middleware('auth:sanctum');
        Route::delete('/unfollow', [ClubController::class, 'unfollow'])->middleware('auth:sanctum');
        // Club Resources
        Route::get('/resources', [ResourceController::class, 'index']);
        Route::post('/resources', [ResourceController::class, 'store'])->middleware('auth:sanctum');
        
        // Club Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [ProjectController::class, 'store'])->middleware('auth:sanctum');
        
        // Club Events
        Route::get('/events', [EventController::class, 'clubEvents']);
    });
});


Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::post('/', [EventController::class, 'store'])->middleware('auth:sanctum');
    
    Route::prefix('{event}')->group(function () {
        Route::get('/', [EventController::class, 'show']);
        Route::put('/', [EventController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [EventController::class, 'destroy'])->middleware('auth:sanctum');
        
        // Event Participation
        Route::post('/attend', [EventController::class, 'attend'])->middleware('auth:sanctum');
        Route::delete('/attend', [EventController::class, 'unattend'])->middleware('auth:sanctum');
        Route::get('/attendees', [EventController::class, 'attendees']);
        
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
        Route::get('/likes', [EventPostController::class, 'likes']);
    });
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
    Route::get('/', [TaskController::class, 'index']);
    Route::post('/', [TaskController::class, 'store']);
    
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
        Route::get('/download', [ResourceController::class, 'download']);
        Route::put('/', [ResourceController::class, 'update'])->middleware('auth:sanctum');
        Route::delete('/', [ResourceController::class, 'destroy'])->middleware('auth:sanctum');
    });
});

Route::prefix('event-types')->middleware(['auth:sanctum', 'can:manage event_types'])->group(function () {
    Route::get('/', [EventTypeController::class, 'index']);
    Route::post('/', [EventTypeController::class, 'store']);
    
    Route::prefix('{eventType}')->group(function () {
        Route::get('/', [EventTypeController::class, 'show']);
        Route::put('/', [EventTypeController::class, 'update']);
        Route::delete('/', [EventTypeController::class, 'destroy']);
    });
});


// Soumission d'événements pour approbation
Route::prefix('submissions')->middleware('auth:sanctum')->group(function () {
    Route::get('/events', [SubmitController::class, 'pendingEvents']);
    Route::post('/events', [SubmitController::class, 'submitEvent']);
    Route::put('/events/{event}', [SubmitController::class, 'reviewEvent'])->middleware('can:review events');
    
    Route::get('/clubs', [SubmitClubController::class, 'pendingClubs']);
    Route::post('/clubs', [SubmitClubController::class, 'submitClub']);
    Route::put('/clubs/{club}', [SubmitClubController::class, 'reviewClub'])->middleware('can:review clubs');
});

Route::prefix('attendance')->middleware('auth:sanctum')->group(function () {
    // Pour les organisateurs/club admins
    Route::post('/events/{event}/mark', [AttendanceController::class, 'markAttendance'])->middleware('can:mark attendance');
    Route::get('/events/{event}/report', [AttendanceController::class, 'attendanceReport'])->middleware('can:view attendance');
    
    // Pour les utilisateurs
    Route::get('/my-attendance', [AttendanceController::class, 'myAttendance']);
});


Route::prefix('discover')->group(function () {
    Route::get('/events', [DiscoverController::class, 'events']);
    Route::get('/clubs', [DiscoverController::class, 'clubs']);
    Route::get('/recommended', [DiscoverController::class, 'recommended'])->middleware('auth:sanctum');
    Route::get('/trending', [DiscoverController::class, 'trending']);
});