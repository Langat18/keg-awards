<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    public function index(Request $request, Cycle $cycle)
    {
        if (! $request->user()->canViewResults()) {
            return response()->json(['message' => 'You do not have permission to view results.'], 403);
        }

        if ($cycle->phase !== 'results') {
            return response()->json(['message' => 'Results have not been published yet.'], 403);
        }

        $rows = DB::table('votes')
            ->join('nominations', 'votes.nomination_id', '=', 'nominations.id')
            ->join('users', 'nominations.nominee_id', '=', 'users.id')
            ->join('categories', 'votes.category_id', '=', 'categories.id')
            ->where('votes.cycle_id', $cycle->id)
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                'categories.sort_order',
                'users.id as nominee_id',
                'users.name as nominee_name',
                'users.department',
                DB::raw('COUNT(votes.id) as vote_count')
            )
            ->groupBy('categories.id', 'categories.name', 'categories.sort_order', 'users.id', 'users.name', 'users.department')
            ->orderBy('categories.sort_order')
            ->orderBy('categories.id')
            ->orderByDesc('vote_count')
            ->orderBy('users.name')
            ->get();

        $results = $rows->groupBy('category_id')->map(function ($nominees) {
            $total = (int) $nominees->sum('vote_count');
            $top = (int) $nominees->max('vote_count');
            $winners = $nominees->where('vote_count', $top)->count();

            $first = $nominees->first();

            return [
                'category_id' => $first->category_id,
                'category_name' => $first->category_name,
                'total_votes' => $total,
                'is_tie' => $top > 0 && $winners > 1,
                'nominees' => $nominees->values()->map(fn ($n) => [
                    'nominee_id' => $n->nominee_id,
                    'nominee_name' => $n->nominee_name,
                    'department' => $n->department,
                    'vote_count' => (int) $n->vote_count,
                    'percentage' => $total > 0 ? round($n->vote_count / $total * 100, 1) : 0,
                    'is_winner' => $top > 0 && (int) $n->vote_count === $top,
                ]),
            ];
        });

        $empty = $cycle->categories()
            ->whereNotIn('id', $results->keys())
            ->get()
            ->map(fn ($category) => [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'total_votes' => 0,
                'is_tie' => false,
                'nominees' => [],
            ]);

        return response()->json($results->values()->concat($empty));
    }
}
