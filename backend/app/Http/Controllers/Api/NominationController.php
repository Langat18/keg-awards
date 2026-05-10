<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use App\Models\Nomination;
use Illuminate\Http\Request;

class NominationController extends Controller
{
    // All nominations for this cycle, with nominee & category info
    public function index(Cycle $cycle)
    {
        return response()->json(
            $cycle->nominations()
                ->with([
                    'nominee:id,name,department',
                    'nominator:id,name',
                    'category:id,name',
                ])
                ->get()
        );
    }

    public function store(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'nominating') {
            return response()->json(['message' => 'Nominations are not open for this cycle.'], 422);
        }

        $data = $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'nominee_id'  => 'required|integer|exists:users,id',
            'reason'      => 'nullable|string|max:600',
        ]);

        // Category must belong to this cycle
        if (! $cycle->categories()->where('id', $data['category_id'])->exists()) {
            return response()->json(['message' => 'Category does not belong to this cycle.'], 422);
        }

        // Duplicate guard (database constraint backs this up too)
        $exists = Nomination::where([
            'cycle_id'    => $cycle->id,
            'category_id' => $data['category_id'],
            'nominee_id'  => $data['nominee_id'],
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'This person is already nominated in that category.'], 422);
        }

        $nomination = Nomination::create([
            'cycle_id'     => $cycle->id,
            'category_id'  => $data['category_id'],
            'nominee_id'   => $data['nominee_id'],
            'nominated_by' => $request->user()->id,
            'reason'       => $data['reason'] ?? null,
            'created_at'   => now(),
        ]);

        return response()->json(
            $nomination->load('nominee:id,name,department', 'category:id,name'),
            201
        );
    }

    // Admin: remove a nomination
    public function destroy(Nomination $nomination)
    {
        $nomination->delete();

        return response()->json(['message' => 'Nomination removed.']);
    }
}

