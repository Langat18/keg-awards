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
            'name'       => 'required|string|max:150',
            'email'      => [
                'required',
                'email',
                'unique:users',
                // Enforce KSG email format
                'regex:/^[a-z]+\.[a-z]+@ksg\.ac\.ke$/i',
            ],
            'password'   => 'required|string|min:8|confirmed',
            'department' => 'nullable|string|max:150',
        ], [
            'email.regex' => 'Only KSG email addresses (firstname.lastname@ksg.ac.ke) are allowed.',
        ]);

        $user = User::create([
            'name'       => $data['name'],
            'email'      => strtolower($data['email']),
            'password'   => $data['password'],
            'department' => $data['department'] ?? null,
            'role'       => 'staff',
        ]);

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('ksg-app')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated. Contact admin.'], 403);
        }

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('ksg-app')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}