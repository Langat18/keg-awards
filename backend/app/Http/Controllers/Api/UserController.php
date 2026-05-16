<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            User::select('id', 'name', 'department')
                ->where('is_active', true)
                ->where('id', '!=', $request->user()->id)
                ->orderBy('name')
                ->get()
        );
    }

    public function adminIndex()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'department', 'role', 'is_active', 'created_at')
                ->orderBy('name')
                ->get()
        );
    }

    public function toggleActive(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be deactivated.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Account activated.' : 'Account deactivated.',
            'is_active' => $user->is_active,
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be deleted.'], 422);
        }

        if ($user->is_active) {
            return response()->json(['message' => 'Deactivate the account before deleting.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}