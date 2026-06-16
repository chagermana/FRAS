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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::apiResource('hospitals', HospitalController::class);
Route::apiResource('wards', WardController::class);
Route::apiResource('resources', ResourceController::class);
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::apiResource('comments', CommentController::class);
Route::apiResource('audit-logs', AuditLogController::class);
Route::apiResource('reports', ReportController::class);
