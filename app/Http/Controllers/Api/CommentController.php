<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Resource;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $query = Comment::with([
            'user:id,name,role',
            'resource:id,name,type,ward_id'
        ]);

        // System admin → see everything
        if ($user->role === 'system_admin') {
            return response()->json($query->latest()->get());
        }

        // Hospital admin → only comments in their hospital
        if ($user->role === 'hospital_admin') {
            $query->whereHas('resource.ward', function ($q) use ($user) {
                $q->where('hospital_id', $user->hospital_id);
            });
            return response()->json($query->latest()->get());
        }

        // Healthcare worker → only comments in their ward
        if ($user->role === 'healthcare_worker') {
            $query->whereHas('resource', function ($q) use ($user) {
                $q->where('ward_id', $user->ward_id);
            });
            return response()->json($query->latest()->get());
        }

        return response()->json([], 403);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'resource_id' => 'required|exists:resources,id',
            'content' => 'required|string|max:1000'
        ]);

        $resource = Resource::with('ward')->findOrFail($validated['resource_id']);

        // Multi-tenancy guard: Healthcare worker must belong to the resource's ward
        if ($user->role === 'healthcare_worker' && $resource->ward_id !== $user->ward_id) {
            return response()->json(['error' => 'Unauthorized. You can only comment on resources within your assigned ward.'], 403);
        }

        // Multi-tenancy guard: Hospital admin must belong to the resource's hospital
        if ($user->role === 'hospital_admin' && $resource->ward->hospital_id !== $user->hospital_id) {
            return response()->json(['error' => 'Unauthorized. This resource belongs to an external facility.'], 403);
        }

        $comment = Comment::create([
            'user_id' => $user->id,
            'resource_id' => $validated['resource_id'],
            'content' => $validated['content']
        ]);

        return response()->json([
            'message' => 'Comment created successfully',
            'data' => $comment->load('user:id,name,role')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = auth()->user();
        $comment = Comment::with(['user', 'resource.ward'])->findOrFail($id);

        if ($user->role === 'hospital_admin' && $comment->resource->ward->hospital_id !== $user->hospital_id) {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        if ($user->role === 'healthcare_worker' && $comment->resource->ward_id !== $user->ward_id) {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        return response()->json($comment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $comment = Comment::findOrFail($id);

        // Guard modification so users can only update their own thoughts
        if (auth()->id() !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized modification attempt.'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $comment->update($validated);

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => $comment
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $comment = Comment::findOrFail($id);

        // Allow author OR facility administrator to delete a comment thread
        if (auth()->id() !== $comment->user_id && auth()->user()->role !== 'hospital_admin') {
            return response()->json(['error' => 'Unauthorized deletion privileges.'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }
}
