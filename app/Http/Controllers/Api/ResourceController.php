<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resource;

class ResourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return response()->json(
            Resource::with('ward')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'ward_id' => 'required|exists:wards,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'quantity' => 'required|integer',
            'status' => 'required|in:available,occupied,maintenance',
        ]);

        $resource = Resource::create($validated);

        return response()->json([
            'message'=>'Resource created successfully',
            'data' => $resource
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        //
        $resource = Resource::with('ward')->findOrFail($id);
        return response()->json($resource);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        //
        $resource = Resource::findOrFail($id);

        $validated = $request->validate([
            'ward_id' => 'sometimes|exists:wards,id',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        $resource->update($validated);

        return response()->json([
            'message' => 'Resource updated successfully',
            'data' => $resource
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->delete();

        return response()->json([
            'message' => 'Resource deleted successfully'
        ]);
    }
}
