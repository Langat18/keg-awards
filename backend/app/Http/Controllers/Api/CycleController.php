<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Cycle;
use Illuminate\Http\Request;

class CycleController extends Controller
{
    // Admin: all cycles
    public function index()
    {
        return Cycle::with('categories')->latest()->get();
    }

    // separate /cycles/active-with-results endpoint if they have access.
    public function active()
    {
        $cycle = Cycle::with('categories')
            ->whereIn('phase', ['nominating', 'voting'])
            ->latest()
            ->first();

        if (! $cycle) {
            return response()->json(['message' => 'No active cycle at the moment.'], 404);
        }

        return response()->json($cycle);
    }

    // Gated by canViewResults() — returns 403 for regular staff.
    public function activeWithResults(Request $request)
    {
        if (! $request->user()->canViewResults()) {
            return response()->json(['message' => 'You do not have permission to view results.'], 403);
        }

        $cycle = Cycle::with('categories')
            ->where('phase', 'results')
            ->latest()
            ->first();

        if (! $cycle) {
            return response()->json(['message' => 'No results published yet.'], 404);
        }

        return response()->json($cycle);
    }

    // Admin: create cycle
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
        ]);

        $cycle = Cycle::create([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'phase'       => 'closed',
            'created_by'  => $request->user()->id,
        ]);

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'cycle_created',
            'target_type' => 'cycle',
            'target_id'   => $cycle->id,
            'notes'       => "Created cycle: {$cycle->title}",
            'created_at'  => now(),
        ]);

        return response()->json($cycle->load('categories'), 201);
    }

    // Admin: update title/description
    public function update(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string',
        ]);

        $cycle->update($data);

        return response()->json($cycle);
    }

    // Admin: advance phase  closed → nominating → voting → results
    public function advancePhase(Request $request, Cycle $cycle)
    {
        $transitions = [
            'closed'     => 'nominating',
            'nominating' => 'voting',
            'voting'     => 'results',
        ];

        if (! isset($transitions[$cycle->phase])) {
            return response()->json(['message' => 'This cycle has already reached the final phase.'], 422);
        }

        $newPhase   = $transitions[$cycle->phase];
        $timestamps = match ($newPhase) {
            'nominating' => ['nominations_open_at' => now()],
            'voting'     => ['voting_open_at'       => now()],
            'results'    => ['results_at'            => now()],
        };

        $cycle->update(array_merge(['phase' => $newPhase], $timestamps));

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'phase_advanced',
            'target_type' => 'cycle',
            'target_id'   => $cycle->id,
            'notes'       => "Phase changed to {$newPhase}",
            'created_at'  => now(),
        ]);

        return response()->json($cycle->load('categories'));
    }

    // Admin: close nominations (nominating → closed)
    public function closeNominations(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'nominating') {
            return response()->json(['message' => 'Nominations are not currently open.'], 422);
        }

        $cycle->update([
            'phase'               => 'closed',
            'nominations_open_at' => null,
        ]);

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'nominations_closed',
            'target_type' => 'cycle',
            'target_id'   => $cycle->id,
            'notes'       => "Nominations closed manually for: {$cycle->title}",
            'created_at'  => now(),
        ]);

        return response()->json($cycle->load('categories'));
    }

    // Admin: delete a closed cycle
    public function destroy(Cycle $cycle)
    {
        if ($cycle->phase !== 'closed') {
            return response()->json(['message' => 'Only closed cycles can be deleted.'], 422);
        }

        $cycle->delete();

        return response()->json(['message' => 'Cycle deleted.']);
    }
}