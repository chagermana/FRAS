<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospital;
use App\Models\Ward;
use App\Models\Resource;
use App\Models\User;


class DashboardController extends Controller
{
    //
        public function publicStats()
        {
            return response()->json([
                'hospitals' => Hospital::count(),
                'wards' => Ward::count(),
                'resources' => Resource::count(),

                'available_resources' => Resource::where('status', 'available')->count(),
                'maintenance_resources' => Resource::where('status', 'maintenance')->count(),
                'occupied_resources' => Resource::where('status', 'occupied')->count(),
            ]);
        }

    public function index()
        {
            return response()->json([
                'hospitals'=>Hospital::count(),
                'wards'=>Ward::count(),
                'resources'=>Resource::count(),
                'users'=>User::count(),
                'available_resources'=>Resource::where('status','available')->count(),
                'maintenance_resources'=>Resource::where('status','maintenance')->count(),
                'occupied_resources'=>Resource::where('status','occupied')->count(),

            ]);
        }

           
        public function hospital()
        {
            return response()->json([
                'message' => 'Hospital dashboard endpoint working',
                'note' => 'Later we will filter by hospital_id for multi-tenant access'
            ]);
        }
}
