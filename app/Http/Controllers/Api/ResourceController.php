<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resource;
use App\Models\AuditLog;
use App\Models\Ward;

class ResourceController extends Controller
{
    /**
     * Display resources based on user role.
     */
    public function index()
    {
        $user = auth()->user();

        // Hospital admin sees all resources in their hospital
        if ($user->role === 'hospital_admin') {

            return response()->json(
                Resource::whereHas('ward', function ($query) use ($user) {
                    $query->where('hospital_id', $user->hospital_id);
                })
                ->with('ward.hospital')
                ->get()
            );
        }

        // Healthcare worker sees only their ward
        if ($user->role === 'healthcare_worker') {

            return response()->json(
                Resource::where('ward_id', $user->ward_id)
                    ->with('ward.hospital')
                    ->get()
            );
        }

        return response()->json([
            'message' => 'Forbidden'
        ], 403);
    }

    /**
     * Hospital admins create resources.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Only hospital admins may create resources
        if ($user->role !== 'hospital_admin') {

            return response()->json([
                'message' => 'Only hospital admins can create resources.'
            ], 403);
        }

        $validated = $request->validate([
            'ward_id' => 'required|exists:wards,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'quantity' => 'required|integer',
            'status' => 'required|in:available,occupied,maintenance',
        ]);

        $ward = Ward::findOrFail($validated['ward_id']);

        // Prevent admins from creating resources outside their hospital
        if ($ward->hospital_id != $user->hospital_id) {

            return response()->json([
                'message' => 'You can only create resources in your own hospital.'
            ], 403);
        }

        $resource = Resource::create($validated);

        return response()->json([
            'message' => 'Resource created successfully',
            'data' => $resource
        ], 201);
    }

    /**
     * Display a single resource.
     */
    public function show($id)
    {
        return response()->json(
            Resource::with('ward.hospital')->findOrFail($id)
        );
    }

    /**
     * Update resource details/status.
     */
    public function update(Request $request, $id)
    {
        $resource = Resource::findOrFail($id);

        $user = auth()->user();

        // Hospital admins can only update resources in their hospital
        if (
            $user->role === 'hospital_admin'
            && $resource->ward->hospital_id != $user->hospital_id
        ) {

            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        // Healthcare workers can only update resources in their ward
        if (
            $user->role === 'healthcare_worker'
            && $resource->ward_id != $user->ward_id
        ) {

            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $oldStatus = $resource->status;

        $validated = $request->validate([
            'ward_id' => 'sometimes|exists:wards,id',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        $resource->update($validated);

        $resource->refresh();

        // Create audit log only if status changed
        if (
            isset($validated['status']) &&
            $oldStatus !== $resource->status
        ) {

            AuditLog::create([
                'user_id' => auth()->id(),
                'resource_id' => $resource->id,
                'old_status' => $oldStatus,
                'new_status' => $resource->status,
                'changed_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Resource updated successfully',
            'data' => $resource
        ]);
    }

    /**
     * Delete a resource.
     */
    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);

        $user = auth()->user();

        // Only hospital admins may delete resources
        if ($user->role !== 'hospital_admin') {

            return response()->json([
                'message' => 'Only hospital admins can delete resources.'
            ], 403);
        }

        // Only from their own hospital
        if ($resource->ward->hospital_id != $user->hospital_id) {

            return response()->json([
                'message' => 'You can only delete resources in your own hospital.'
            ], 403);
        }

        $resource->delete();

        return response()->json([
            'message' => 'Resource deleted successfully'
        ]);
    }

    /**
     * Public search endpoint.
     */
    public function publicIndex(Request $request)
    {
        $query = Resource::with('ward.hospital');

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->limit(50)->get()
        );
    }
}