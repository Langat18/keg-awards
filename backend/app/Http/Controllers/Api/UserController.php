<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Staff: nominee picker (exclude self, show active only)
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

    // Admin: full user list
    public function adminIndex()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'department', 'role', 'is_active', 'created_at')
                ->orderBy('name')
                ->get()
        );
    }

    // Admin: activate / deactivate a staff account
    public function toggleActive(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be deactivated this way.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Account activated.' : 'Account deactivated.',
            'is_active' => $user->is_active,
        ]);
    }
}