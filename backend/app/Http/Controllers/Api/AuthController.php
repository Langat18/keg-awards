<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => ['required', 'email', 'max:150', 'unique:users', 'regex:/^[a-z]+\.[a-z]+@ksg\.ac\.ke$/i'],
            'password' => 'required|string|min:8|confirmed',
            'department' => 'nullable|string|max:150',
        ], [
            'email.regex' => 'Use your KSG email address (firstname.lastname@ksg.ac.ke).',
            'email.unique' => 'An account with this email already exists. Sign in instead.',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'department' => $data['department'] ?? null,
            'role' => 'staff',
        ]);

        return response()->json([
            'user' => $user->fresh(),
            'token' => $user->createToken('ksg-app')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The email or password is incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated. Contact the administrator.'], 403);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('ksg-app')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
