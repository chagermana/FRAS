<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resource;
use App\Models\AuditLog;

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

        //get old status before update
        $oldStatus = $resource->status;

        $validated = $request->validate([
            'ward_id' => 'sometimes|exists:wards,id',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        //update resource
        $resource->update($validated);

        $resource->refresh(); // Refresh the model instance to get the latest data from the database

        //get new status after update
        $newStatus = $resource->status;

        AuditLog::create([
            'user_id' => 1, // (we'll fix this later if no login yet)
            'resource_id' => $resource->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_at' => now()
        ]);
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
