<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CycleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NominationController;
use App\Http\Controllers\Api\VoteController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\UserController;

//  Public 
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout',    [AuthController::class,  'logout']);
    Route::get('/auth/me',         [AuthController::class,  'me']);
    Route::patch('/auth/profile',  [ProfileController::class, 'update']);
    Route::patch('/auth/password', [ProfileController::class, 'changePassword']);

    // All staff can read these
    Route::get('/cycles/active',                      [CycleController::class,     'active']);
    Route::get('/cycles/{cycle}/categories',          [CategoryController::class,  'index']);
    Route::get('/cycles/{cycle}/nominations',         [NominationController::class,'index']);
    Route::get('/cycles/{cycle}/my-votes',            [VoteController::class,      'myVotes']);
    Route::get('/cycles/{cycle}/results',             [ResultController::class,    'index']);
    Route::get('/users',                              [UserController::class,      'index']);

    // Nominations & votes (staff actions, phase-gated in controller)
    Route::post('/cycles/{cycle}/nominations',        [NominationController::class,'store']);
    Route::post('/cycles/{cycle}/votes',              [VoteController::class,      'store']);

    //  Admin only 
    Route::middleware('admin')->group(function () {
        Route::get('/cycles',                         [CycleController::class,    'index']);
        Route::post('/cycles',                        [CycleController::class,    'store']);
        Route::put('/cycles/{cycle}',                 [CycleController::class,    'update']);
        Route::delete('/cycles/{cycle}',              [CycleController::class,    'destroy']);
        Route::post('/cycles/{cycle}/phase',          [CycleController::class,    'advancePhase']);

        Route::post('/cycles/{cycle}/categories',           [CategoryController::class, 'store']);
        Route::put('/cycles/{cycle}/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/cycles/{cycle}/categories/{category}', [CategoryController::class, 'destroy']);

        Route::delete('/nominations/{nomination}',    [NominationController::class,'destroy']);

        Route::get('/admin/users',                    [UserController::class,      'adminIndex']);
        Route::patch('/admin/users/{user}/toggle',    [UserController::class,      'toggleActive']);
    });
});