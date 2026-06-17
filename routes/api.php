<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HospitalController;
use App\Http\Controllers\Api\WardController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AuthController;

//Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//protected routes
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
    return $request->user();
    });

    Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});

    Route::apiResource('hospitals', HospitalController::class);
    Route::apiResource('wards', WardController::class);
    Route::apiResource('resources', ResourceController::class);
    Route::apiResource('comments', CommentController::class);
    Route::apiResource('audit-logs', AuditLogController::class);
    Route::apiResource('reports', ReportController::class);

    Route::get('/dashboard', [DashboardController::class, 'index']);


});