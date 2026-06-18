<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CycleController extends Controller
{
    // Admin: all cycles
    public function index()
    {
        return Cycle::with('categories')->latest()->get();
    }

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

    public function destroy(Cycle $cycle)
    {
        if ($cycle->phase !== 'closed') {
            return response()->json(['message' => 'Only closed cycles can be deleted.'], 422);
        }

        $cycle->delete();

        return response()->json(['message' => 'Cycle deleted.']);
    }

    public function forceDestroy(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'confirm_title' => 'required|string',
        ]);

        if ($data['confirm_title'] !== $cycle->title) {
            return response()->json(['message' => 'Confirmation text does not match the cycle title.'], 422);
        }

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'cycle_force_deleted',
            'target_type' => 'cycle',
            'target_id'   => $cycle->id,
            'notes'       => "Force-deleted cycle '{$cycle->title}' while in phase '{$cycle->phase}'",
            'created_at'  => now(),
        ]);

        $cycle->delete();

        return response()->json(['message' => 'Cycle permanently deleted.']);
    }

    public function clone(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
        ]);

        $newCycle = DB::transaction(function () use ($request, $cycle, $data) {
            $new = Cycle::create([
                'title'       => $data['title'],
                'description' => $cycle->description,
                'phase'       => 'closed',
                'created_by'  => $request->user()->id,
            ]);

            foreach ($cycle->categories as $category) {
                Category::create([
                    'cycle_id'    => $new->id,
                    'name'        => $category->name,
                    'description' => $category->description,
                    'criteria'    => $category->criteria,
                    'sort_order'  => $category->sort_order,
                ]);
            }

            AuditLog::create([
                'user_id'     => $request->user()->id,
                'action'      => 'cycle_cloned',
                'target_type' => 'cycle',
                'target_id'   => $new->id,
                'notes'       => "Cloned from cycle '{$cycle->title}' (#{$cycle->id})",
                'created_at'  => now(),
            ]);

            return $new;
        });

        return response()->json($newCycle->load('categories'), 201);
    }
}