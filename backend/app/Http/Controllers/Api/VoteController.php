<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use App\Models\Nomination;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function store(Request $request, Cycle $cycle)
    {
        if ($cycle->phase !== 'voting') {
            return response()->json(['message' => 'Voting is not open for this cycle.'], 422);
        }

        $data = $request->validate([
            'category_id'   => 'required|integer|exists:categories,id',
            'nomination_id' => 'required|integer|exists:nominations,id',
        ]);

        $nomination = Nomination::where([
            'id'          => $data['nomination_id'],
            'cycle_id'    => $cycle->id,
            'category_id' => $data['category_id'],
        ])->first();

        if (! $nomination) {
            return response()->json(['message' => 'Invalid nomination for this cycle/category.'], 422);
        }

        // if ($nomination->nominee_id === $request->user()->id) {
        //     return response()->json(['message' => 'You cannot vote for yourself.'], 422);
        // }

        $vote = Vote::updateOrCreate(
            [
                'cycle_id'    => $cycle->id,
                'category_id' => $data['category_id'],
                'voter_id'    => $request->user()->id,
            ],
            [
                'nomination_id' => $data['nomination_id'],
                'created_at'    => now(),
            ]
        );

        return response()->json(['message' => 'Vote recorded.', 'vote' => $vote], 201);
    }

    public function myVotes(Request $request, Cycle $cycle)
    {
        return response()->json(
            Vote::where([
                'cycle_id' => $cycle->id,
                'voter_id' => $request->user()->id,
            ])->get()
        );
    }
}

