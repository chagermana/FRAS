<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ward;

class WardController extends Controller
{
    /**
     * Display a listing of the resource scoped by role.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'system_admin') {
            return response()->json(Ward::with('resources')->get());
        }

        // Hospital admins and healthcare workers only view their own facility's wards
        return response()->json(
            Ward::where('hospital_id', $user->hospital_id)->with('resources')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hospital_id' => $user->role === 'system_admin' ? 'required|exists:hospitals,id' : 'nullable',
        ]);

        // Force-bind hospital_id if the creator is a hospital_admin
        if ($user->role !== 'system_admin') {
            $validated['hospital_id'] = $user->hospital_id;
        }

        $ward = Ward::create($validated);

        return response()->json([
            'message' => 'Ward created successfully',
            'data' => $ward
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = auth()->user();
        $ward = Ward::with('resources')->findOrFail($id);

        if ($user->role !== 'system_admin' && $ward->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($ward);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = auth()->user();
        $ward = Ward::findOrFail($id);

        if ($user->role !== 'system_admin' && $ward->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'hospital_id' => $user->role === 'system_admin' ? 'sometimes|exists:hospitals,id' : 'prohibited',
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
        $user = auth()->user();
        $ward = Ward::findOrFail($id);

        if ($user->role !== 'system_admin' && $ward->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ward->delete();

        return response()->json([
            'message' => 'Ward deleted successfully'
        ]);
    }
}
