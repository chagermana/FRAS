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
            'role' => 'required|in:hospital_admin,healthcare_worker',
            'hospital_id' => 'nullable|exists:hospitals,id',
            'ward_id' => [
                $request->role === 'healthcare_worker' ? 'required' : 'nullable',
                \Illuminate\Validation\Rule::exists('wards', 'id')->where('hospital_id', $request->hospital_id),
            ],
        ]);

        // Hospital Admin baseline checks
        if (
            $validated['role'] === 'hospital_admin'
            && !empty($validated['ward_id'])
        ) {
            return response()->json([
                'message' => 'Hospital admins cannot belong to a ward.'
            ], 422);
        }

        // Healthcare Worker baseline checks
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

        $status = $validated['role'] === 'system_admin' ? 'approved' : 'pending';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'healthcare_worker',
            'hospital_id' => $validated['hospital_id'] ?? null,
            'ward_id' => $validated['ward_id'] ?? null,
            'status' => $status,
        ]);

        if ($status === 'pending') {
            return response()->json([
                'message' => 'Registration submitted. Your account is awaiting approval.'
            ], 201);
        }

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

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Your account is still awaiting approval.'
            ], 403);
        }

        if ($user->status === 'rejected') {
            return response()->json([
                'message' => 'Your registration was rejected. Contact your administrator.'
            ], 403);
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
