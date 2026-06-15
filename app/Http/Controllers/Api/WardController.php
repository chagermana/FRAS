<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ward;

class WardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Ward::with('resources')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'name' => 'required|string|max:255',
 
        ]);

        $ward = Ward::create($validated);

        return response()->json([
            'message'=>'Ward created successfully',
            'data' => $ward
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        //
        $ward = Ward::with('resources')->findOrFail($id);
        return response()->json($ward);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
                $ward = Ward::findOrFail($id);

        $validated = $request->validate([
            'hospital_id' => 'sometimes|exists:hospitals,id',
            'name' => 'sometimes|string|max:255',

        ]);

        $ward->update($validated);

        return response()->json([
            'message' => 'Ward updated successfully',
            'data' => $ward
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
            $ward = Ward::findOrFail($id);
            $ward->delete();

            return response()->json([
            'message' => 'Ward deleted successfully'
        ]);
    }
}
