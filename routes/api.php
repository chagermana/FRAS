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

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/public/dashboard', [DashboardController::class, 'publicStats']);

// public resource listing (with search)
Route::get('/public/resources', [ResourceController::class, 'publicIndex']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES (ALL LOGGED IN USERS)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | SYSTEM ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:system_admin')->group(function () {

        Route::apiResource('hospitals', HospitalController::class);
        Route::apiResource('wards', WardController::class);
        Route::apiResource('resources', ResourceController::class);
        Route::apiResource('audit-logs', AuditLogController::class);
        Route::apiResource('reports', ReportController::class);

        Route::get('/dashboard', [DashboardController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | SYSTEM ADMIN + HOSPITAL ADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:system_admin,hospital_admin')->group(function () {

        Route::apiResource('comments', CommentController::class);
        Route::get('/dashboard/hospital', [DashboardController::class, 'hospital']);
    });

    /*
    |--------------------------------------------------------------------------
    | ALL ROLES (READ ONLY ACCESS)
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:system_admin,hospital_admin,healthcare_worker')->group(function () {

        Route::get('/resources', [ResourceController::class, 'index']);
        Route::get('/wards', [WardController::class, 'index']);
    });

});