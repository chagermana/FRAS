<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        // System admin sees everyone
        if ($user->role === 'system_admin') {
            return response()->json(
                User::with(['hospital', 'ward'])->get()
            );
        }

        // Hospital admin sees only users in their hospital
        if ($user->role === 'hospital_admin') {
            $users = User::where('hospital_id', $user->hospital_id)
                ->with(['hospital', 'ward'])
                ->get();

            return response()->json($users);
        }

        return response()->json([], 403);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = auth()->user();
        $target = User::with(['hospital', 'ward'])->findOrFail($id);

        if ($user->role === 'hospital_admin' && $target->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($target);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $target = User::findOrFail($id);

        if ($user->role === 'hospital_admin' && $target->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $target->id,
            'role' => 'sometimes|in:system_admin,hospital_admin,healthcare_worker',
            'hospital_id' => 'sometimes|nullable|exists:hospitals,id',
            'ward_id' => 'sometimes|nullable|exists:wards,id',
        ]);

        $target->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $target
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $target = User::findOrFail($id);

        if ($user->role === 'hospital_admin' && $target->hospital_id !== $user->hospital_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $target->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
