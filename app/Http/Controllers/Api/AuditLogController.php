<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Eager load relations including nested ward relationship to get hospital context
        $query = AuditLog::with(['user', 'resource.ward']);

        // Enforce structural data isolation
        if ($user->role === 'hospital_admin') {
            $query->whereHas('resource.ward', function ($q) use ($user) {
                $q->where('hospital_id', $user->hospital_id);
            });
        } elseif ($user->role !== 'system_admin') {
            // Protect logs against unauthorized low-level access (e.g., public or ward_staff)
            abort(403, 'Unauthorized access to system audit logs.');
        }

        return response()->json($query->latest('id')->get());
    }

    public function store(Request $request) {}
    public function show(string $id) {}
    public function update(Request $request, string $id) {}
    public function destroy(string $id) {}
}
