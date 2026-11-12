<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'department' => 'nullable|string|max:150',
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh());
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        $minimum = $user->isAdmin() ? 12 : 8;

        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => "required|string|min:{$minimum}|confirmed|different:current_password",
        ], [
            'password.different' => 'The new password must be different from the current one.',
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update(['password' => $data['password']]);

        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password changed. Other devices have been signed out.']);
    }
}
