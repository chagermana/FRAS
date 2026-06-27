<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',

            'role' => 'required|in:system_admin,hospital_admin,healthcare_worker',

            'hospital_id' => 'nullable|exists:hospitals,id',
            'ward_id' => 'nullable|exists:wards,id',
    ]);

    if (
        $validated['role'] === 'system_admin'
        && (
            isset($validated['hospital_id'])
            || isset($validated['ward_id'])
        )
    ) {
        return response()->json([
            'message' => 'System admins cannot belong to a hospital or ward.'
        ], 422);
    }

    if (
        $validated['role'] === 'hospital_admin'
        && empty($validated['hospital_id'])
    ) {
        return response()->json([
            'message' => 'Hospital admins must have a hospital.'
        ], 422);
    }

    if (
        $validated['role'] === 'hospital_admin'
        && !empty($validated['ward_id'])
    ) {
        return response()->json([
            'message' => 'Hospital admins cannot belong to a ward.'
        ], 422);
    }

    if (
        $validated['role'] === 'healthcare_worker'
        && (
            empty($validated['hospital_id'])
            || empty($validated['ward_id'])
        )
    ) {
        return response()->json([
            'message' => 'Healthcare workers must belong to both a hospital and a ward.'
        ], 422);
}
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'healthcare_worker',
            'hospital_id' => $validated['hospital_id'] ?? null,
            'ward_id' => $validated['ward_id'] ?? null,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
    {
        
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password))
        {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}