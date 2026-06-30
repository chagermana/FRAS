<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Report::with(['hospital', 'user']);

        // Context-driven row-level data isolation
        if ($user->role === 'hospital_admin') {
            $query->where('hospital_id', $user->hospital_id);
        } elseif ($user->role !== 'system_admin') {
            abort(403, 'Unauthorized access to reporting logs.');
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Enforce backend parameters over user inputs to prevent boundary cross-posting
        if ($user->role === 'hospital_admin') {
            $request->merge(['hospital_id' => $user->hospital_id]);
        }
        
        // Always bind the generator to the actual authenticated actor session
        $request->merge(['generated_by' => $user->id]);

        $validated = $request->validate([
            'hospital_id' => 'required|exists:hospitals,id',
            'generated_by' => 'required|exists:users,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date',
            'content' => 'required|string'
        ]);

        $validated['generated_at'] = now();

        $report = Report::create($validated);

        // Load relations before response so frontend updates gracefully
        $report->load(['hospital', 'user']);

        return response()->json([
            'message' => 'Report created successfully',
            'data' => $report
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $report = Report::with(['hospital', 'user'])->findOrFail($id);

        if ($user->role === 'hospital_admin' && $report->hospital_id !== $user->hospital_id) {
            abort(403, 'Unauthorized access to this document framework.');
        }

        return response()->json($report);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $report = Report::findOrFail($id);

        if ($user->role === 'hospital_admin' && $report->hospital_id !== $user->hospital_id) {
            abort(403, 'Unauthorized modification context.');
        }

        $validated = $request->validate([
            'content' => 'sometimes|string'
        ]);

        $report->update($validated);

        return response()->json([
            'message' => 'Report updated successfully',
            'data' => $report
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $report = Report::findOrFail($id);

        if ($user->role === 'hospital_admin' && $report->hospital_id !== $user->hospital_id) {
            abort(403, 'Unauthorized deletion privileges.');
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }
}
