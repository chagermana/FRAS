<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hospital;


class HospitalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function publicIndex()
        {
            $hospitals = \App\Models\Hospital::with('wards.resources')->get();

            $data = $hospitals->map(function ($hospital) {

                $resources = $hospital->wards->flatMap->resources;

                return [

                    'id' => $hospital->id,
                    'name' => $hospital->name,

                    'total_resources' => $resources->count(),

                    'available_resources' =>
                        $resources->where('status', 'available')->count(),

                    'occupied_resources' =>
                        $resources->where('status', 'occupied')->count(),

                    'maintenance_resources' =>
                        $resources->where('status', 'maintenance')->count(),
                ];
            });

            return response()->json($data);
        }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
            $validated = $request->validate([
            'name' => 'required|string|max:255',
            'county' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            
        ]);

        $hospital = Hospital::create($validated);

        return response()->json([
            'message' => 'Hospital created successfully',
            'data' => $hospital
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $hospital = Hospital::findOrFail($id);
        return response()->json($hospital);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $hospital = Hospital::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'county' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
        ]);

        $hospital->update($validated);

        return response()->json([
            'message' => 'Hospital updated successfully',
            'data' => $hospital
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $hospital = Hospital::findOrFail($id);
        $hospital->delete();

         return response()->json([
            'message' => 'Hospital deleted successfully'
        ]);
    }
}
