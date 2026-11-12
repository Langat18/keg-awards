<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Cycle;
use App\Models\Nomination;
use App\Models\User;
use Illuminate\Http\Request;

class NominationController extends Controller
{
    public function index(Request $request, Cycle $cycle)
    {
        $user = $request->user();

        $relations = ['nominee:id,name,department', 'category:id,name'];

        if ($user->isAdmin()) {
            $relations[] = 'nominator:id,name';
        }

        $nominations = $cycle->nominations()->with($relations)->orderBy('id')->get();

        if (! $user->isAdmin()) {
            $nominations->each(function (Nomination $nomination) use ($user) {
                if ($nomination->nominated_by !== $user->id) {
                    $nomination->makeHidden(['reason', 'nominated_by']);
                }
            });
        }

        return response()->json($nominations);
    }

    public function store(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'nominating') {
            return response()->json(['message' => 'Nominations are not open for this cycle.'], 422);
        }

        $data = $request->validate([
            'category_id' => 'required|integer',
            'nominee_id' => 'required|integer',
            'reason' => 'nullable|string|max:600',
        ]);

        if (! $cycle->categories()->whereKey($data['category_id'])->exists()) {
            return response()->json(['message' => 'That category is not part of this cycle.'], 422);
        }

        $nominee = User::whereKey($data['nominee_id'])->where('is_active', true)->first();

        if (! $nominee) {
            return response()->json(['message' => 'That staff member could not be found.'], 422);
        }

        $exists = Nomination::where([
            'cycle_id' => $cycle->id,
            'category_id' => $data['category_id'],
            'nominee_id' => $nominee->id,
        ])->exists();

        if ($exists) {
            return response()->json(['message' => "{$nominee->name} is already nominated in this category."], 422);
        }

        $nomination = Nomination::create([
            'cycle_id' => $cycle->id,
            'category_id' => $data['category_id'],
            'nominee_id' => $nominee->id,
            'nominated_by' => $request->user()->id,
            'reason' => $data['reason'] ?? null,
            'created_at' => now(),
        ]);

        return response()->json(
            $nomination->load('nominee:id,name,department', 'category:id,name'),
            201
        );
    }

    public function destroy(Request $request, Nomination $nomination)
    {
        $nomination->loadMissing('nominee:id,name', 'category:id,name');

        AuditLog::record(
            $request->user(),
            'nomination_removed',
            $nomination,
            "Removed {$nomination->nominee?->name} from {$nomination->category?->name}",
        );

        $nomination->delete();

        return response()->json(['message' => 'Nomination removed.']);
    }
}
