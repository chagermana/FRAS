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

public function approve($id)
    {
        $user = auth()->user();
        $target = User::findOrFail($id);

        if ($user->role === 'hospital_admin') {
            if ($target->role !== 'healthcare_worker' || $target->hospital_id !== $user->hospital_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } elseif ($user->role === 'system_admin') {
            if ($target->role !== 'hospital_admin') {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $target->update(['status' => 'approved']);

        return response()->json([
            'message' => 'User approved successfully',
            'data' => $target
        ]);
    }

    public function reject($id)
    {
        $user = auth()->user();
        $target = User::findOrFail($id);

        if ($user->role === 'hospital_admin') {
            if ($target->role !== 'healthcare_worker' || $target->hospital_id !== $user->hospital_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } elseif ($user->role === 'system_admin') {
            if ($target->role !== 'hospital_admin') {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $target->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'User rejected successfully',
            'data' => $target
        ]);
    }

    public function storeAdmin(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'system_admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $newAdmin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'system_admin',
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'System admin created successfully',
            'data' => $newAdmin
        ], 201);
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
