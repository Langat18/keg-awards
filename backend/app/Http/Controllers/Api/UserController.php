<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Nomination;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::select('id', 'name', 'department')
            ->where('is_active', true)
            ->where('role', 'staff')
            ->orderBy('name')
            ->get();
    }

    public function adminIndex()
    {
        return User::select('id', 'name', 'email', 'department', 'role', 'is_active', 'can_view_results', 'created_at')
            ->orderBy('name')
            ->get();
    }

    public function toggleActive(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrator accounts cannot be deactivated here.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        AuditLog::record($request->user(), $user->is_active ? 'user_activated' : 'user_deactivated', $user, $user->email);

        return response()->json($user->only('id', 'name', 'is_active', 'can_view_results', 'role'));
    }

    public function toggleResultsAccess(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrators always have access to results.'], 422);
        }

        $user->update(['can_view_results' => ! $user->can_view_results]);

        AuditLog::record(
            $request->user(),
            $user->can_view_results ? 'results_access_granted' : 'results_access_revoked',
            $user,
            $user->email,
        );

        return response()->json($user->only('id', 'name', 'can_view_results', 'role'));
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Administrator accounts cannot be deleted here.'], 422);
        }

        $hasHistory = Nomination::where('nominee_id', $user->id)->orWhere('nominated_by', $user->id)->exists()
            || Vote::where('voter_id', $user->id)->exists();

        if ($hasHistory) {
            return response()->json([
                'message' => "{$user->name} has nominations or votes on record, so the account can only be deactivated.",
            ], 422);
        }

        AuditLog::record($request->user(), 'user_deleted', $user, $user->email);

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
