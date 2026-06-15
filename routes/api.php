<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HospitalController;
use App\Http\Controllers\Api\WardController;
use App\Http\Controllers\Api\ResourceController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::apiResource('hospitals', HospitalController::class);
Route::apiResource('wards', WardController::class);
Route::apiResource('resources', ResourceController::class);