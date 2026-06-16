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
    public function index()
    {
        //
        return response()->json(
            Report::all()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
        'hospital_id' => 'required|exists:hospitals,id',
        'generated_by' => 'required|exists:users,id',
        'period_start' => 'required|date',
        'period_end' => 'required|date',
        'content' => 'required|string'
    ]);

    $validated['generated_at'] = now(); 
    
        $report = Report::create($validated);

        return response()->json([
            'message' => 'Report created successfully',
            'data' => $report
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        return response()->json(
            Report::findOrFail($id)
        );

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $report = Report::findOrFail($id);

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
    public function destroy(string $id)
    {
        //
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }
}
