<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CycleController extends Controller
{
    private const NEXT_PHASE = [
        'closed' => 'nominating',
        'nominating' => 'voting',
        'voting' => 'results',
    ];

    public function index()
    {
        return Cycle::with('categories')
            ->withCount(['nominations', 'votes'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    public function active()
    {
        $cycle = Cycle::with('categories')
            ->whereIn('phase', ['nominating', 'voting'])
            ->latest()
            ->first();

        $cycle ??= Cycle::with('categories')
            ->where('phase', 'results')
            ->latest('results_at')
            ->first();

        if (! $cycle) {
            return response()->json(['message' => 'There is no awards cycle running right now.'], 404);
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
            ->latest('results_at')
            ->first();

        if (! $cycle) {
            return response()->json(['message' => 'No results have been published yet.'], 404);
        }

        return response()->json($cycle);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
        ]);

        $cycle = Cycle::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'phase' => 'closed',
            'created_by' => $request->user()->id,
        ]);

        AuditLog::record($request->user(), 'cycle_created', $cycle, "Created cycle: {$cycle->title}");

        return response()->json($cycle->load('categories'), 201);
    }

    public function update(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
        ]);

        $cycle->update($data);

        return response()->json($cycle->load('categories'));
    }

    public function advancePhase(Request $request, Cycle $cycle)
    {
        $next = self::NEXT_PHASE[$cycle->phase] ?? null;

        if (! $next) {
            return response()->json(['message' => 'Results for this cycle are already published.'], 422);
        }

        if ($next === 'nominating') {
            if ($cycle->categories()->doesntExist()) {
                return response()->json(['message' => 'Add at least one category before opening nominations.'], 422);
            }

            $running = Cycle::whereIn('phase', ['nominating', 'voting'])
                ->whereKeyNot($cycle->id)
                ->first();

            if ($running) {
                return response()->json([
                    'message' => "\"{$running->title}\" is still running. Publish its results before opening another cycle.",
                ], 422);
            }
        }

        $cycle->update([
            'phase' => $next,
            match ($next) {
                'nominating' => 'nominations_open_at',
                'voting' => 'voting_open_at',
                'results' => 'results_at',
            } => now(),
        ]);

        AuditLog::record($request->user(), 'phase_advanced', $cycle, "Phase changed to {$next}");

        return response()->json($cycle->load('categories'));
    }

    public function closeNominations(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'nominating') {
            return response()->json(['message' => 'Nominations are not open for this cycle.'], 422);
        }

        $cycle->update([
            'phase' => 'closed',
            'nominations_open_at' => null,
        ]);

        AuditLog::record($request->user(), 'nominations_closed', $cycle, "Nominations paused for: {$cycle->title}");

        return response()->json($cycle->load('categories'));
    }

    public function destroy(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'closed') {
            return response()->json(['message' => 'Only closed cycles can be deleted.'], 422);
        }

        AuditLog::record($request->user(), 'cycle_deleted', $cycle, "Deleted cycle '{$cycle->title}'");

        $cycle->delete();

        return response()->json(['message' => 'Cycle deleted.']);
    }

    public function forceDestroy(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'confirm_title' => 'required|string',
        ]);

        if ($data['confirm_title'] !== $cycle->title) {
            return response()->json(['message' => 'The text you typed does not match the cycle title.'], 422);
        }

        AuditLog::record(
            $request->user(),
            'cycle_force_deleted',
            $cycle,
            "Force-deleted cycle '{$cycle->title}' while in phase '{$cycle->phase}'",
        );

        $cycle->delete();

        return response()->json(['message' => 'Cycle permanently deleted.']);
    }

    public function clone(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
        ]);

        $copy = DB::transaction(function () use ($request, $cycle, $data) {
            $copy = Cycle::create([
                'title' => $data['title'],
                'description' => $cycle->description,
                'phase' => 'closed',
                'created_by' => $request->user()->id,
            ]);

            $copy->categories()->createMany(
                $cycle->categories->map->only(['name', 'description', 'criteria', 'sort_order'])->all()
            );

            AuditLog::record($request->user(), 'cycle_cloned', $copy, "Cloned from '{$cycle->title}' (#{$cycle->id})");

            return $copy;
        });

        return response()->json($copy->load('categories'), 201);
    }
}
