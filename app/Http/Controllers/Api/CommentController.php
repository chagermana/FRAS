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
        //
        return response()->json(
        Comment::with(['user', 'resource'])->get()
    );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated=$request->validate([
            'user_id'=>'required|exists:users,id',
            'resource_id'=>'required|exists:resources,id',
            'content'=>'required|string'
        ]);

        $comment=Comment::create($validated);
        
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
