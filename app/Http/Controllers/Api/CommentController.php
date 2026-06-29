<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $user = auth()->user();

    $query = Comment::with([
        'user',
        'resource.ward.hospital'
    ]);

    // System admin → see everything
    if ($user->role === 'system_admin') {
        return response()->json($query->get());
    }

    // Hospital admin → only comments in their hospital
    if ($user->role === 'hospital_admin') {

        $query->whereHas('resource.ward', function ($q) use ($user) {
            $q->where('hospital_id', $user->hospital_id);
        });

        return response()->json($query->get());
    }

    // Healthcare worker → only comments in their ward
    if ($user->role === 'healthcare_worker') {

        $query->whereHas('resource', function ($q) use ($user) {
            $q->where('ward_id', $user->ward_id);
        });

        return response()->json($query->get());
    }

    return response()->json([], 403);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated=$request->validate([
            'resource_id'=>'required|exists:resources,id',
            'content'=>'required|string'
        ]);

        $comment=Comment::create([
            'user_id' => auth()->id(),
            'resource_id' => $validated['resource_id'],
            'content' => $validated['content']
        ]);

        return response()->json([
            'message' => 'Comment created successfully',
            'data' => $comment
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        return response()->json(
            Comment::with(['user','resource'])->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $comment=Comment::findOrFail($id);

        $validated=$request->validate([
            'content'=>'sometimes|string'
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
        //
        $comment=Comment::findOrFail($id);
        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }
}
