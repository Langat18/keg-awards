<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Staff: list all active users (for nomination dropdowns)
    public function index()
    {
        return User::select('id', 'name', 'department')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    // Admin: full user list
    public function adminIndex()
    {
        return User::select('id', 'name', 'email', 'department', 'role', 'is_active', 'can_view_results')
            ->orderBy('name')
            ->get();
    }

    // Admin: toggle active status
    public function toggleActive(User $user)
    {
        $user->update(['is_active' => ! $user->is_active]);

        return response()->json($user->only('id', 'name', 'is_active', 'can_view_results', 'role'));
    }

    // Admin: toggle results-viewing access for non-admin staff
    public function toggleResultsAccess(User $user)
    {
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Admins always have results access. This flag only applies to staff.',
            ], 422);
        }

        $user->update(['can_view_results' => ! $user->can_view_results]);

        return response()->json($user->only('id', 'name', 'can_view_results', 'role'));
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}