<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    public function index(Cycle $cycle)
    {
        if ($cycle->phase !== 'results') {
            return response()->json(['message' => 'Results have not been published yet.'], 403);
        }

        $rows = DB::table('votes')
            ->join('nominations', 'votes.nomination_id', '=', 'nominations.id')
            ->join('users',       'nominations.nominee_id', '=', 'users.id')
            ->join('categories',  'votes.category_id', '=', 'categories.id')
            ->where('votes.cycle_id', $cycle->id)
            ->select(
                'categories.id   as category_id',
                'categories.name as category_name',
                'categories.sort_order',
                'users.id        as nominee_id',
                'users.name      as nominee_name',
                'users.department',
                DB::raw('COUNT(votes.id) as vote_count')
            )
            ->groupBy(
                'categories.id',
                'categories.name',
                'categories.sort_order',
                'users.id',
                'users.name',
                'users.department'
            )
            ->orderBy('categories.sort_order')
            ->orderByDesc('vote_count')
            ->get();

        $grouped = $rows->groupBy('category_id')->map(function ($nominees) {
            $total = $nominees->sum('vote_count');

            $list = $nominees->values()->map(function ($n, $idx) use ($total) {
                return [
                    'nominee_id'   => $n->nominee_id,
                    'nominee_name' => $n->nominee_name,
                    'department'   => $n->department,
                    'vote_count'   => (int) $n->vote_count,
                    'percentage'   => $total > 0 ? round(($n->vote_count / $total) * 100, 1) : 0,
                    'is_winner'    => $idx === 0,
                ];
            });

            $first = $nominees->first();
            return [
                'category_id'   => $first->category_id,
                'category_name' => $first->category_name,
                'total_votes'   => (int) $total,
                'nominees'      => $list,
            ];
        })->values();

        return response()->json($grouped);
    }
}