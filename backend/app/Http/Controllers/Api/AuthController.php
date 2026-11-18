<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'password' => 'required|string|min:8|confirmed',
            'department' => 'nullable|string|max:150',
        ]);

        $email = StaffMember::cleanEmail($data['email']);

        if (User::where('email', $email)->exists()) {
            $this->fail('email', 'An account with this email already exists. Sign in instead.');
        }

        $member = StaffMember::where('email', $email)->first();

        if ($member?->hasLeft()) {
            $this->fail('email', 'This email is no longer on the staff list. Contact the administrator if this is a mistake.');
        }

        if ($member?->user_id) {
            $this->fail('email', 'An account already exists for this person. Sign in instead, or ask the administrator to reset your password.');
        }

        if (! $member && ! $this->domainAllowed($email)) {
            $this->fail('email', 'This email is not on the staff list. Use the email HR has on record for you, or ask the administrator to add you.');
        }

        $user = DB::transaction(function () use ($data, $email, $member) {
            $member ??= StaffMember::create([
                'name' => StaffMember::cleanName($data['name']),
                'department' => StaffMember::cleanName($data['department'] ?? null),
                'email' => $email,
            ]);

            $user = User::create([
                'name' => StaffMember::cleanName($data['name']),
                'email' => $email,
                'login_id' => $member->loginId(),
                'password' => $data['password'],
                'department' => StaffMember::cleanName($data['department'] ?? null) ?? $member->department,
                'role' => 'staff',
            ]);

            $member->update(['user_id' => $user->id]);

            return $user;
        });

        return response()->json([
            'user' => $user->fresh(),
            'token' => $user->createToken('ksg-app')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge(['login' => $request->input('login', $request->input('email'))]);

        $data = $request->validate([
            'login' => 'required|string|max:150',
            'password' => 'required|string',
        ], [
            'login.required' => 'Enter your email or sign-in ID.',
        ]);

        $user = $this->findUser(trim($data['login']));

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            $this->fail('login', 'The sign-in details are incorrect.');
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

    private function findUser(string $login): ?User
    {
        if (str_contains($login, '@')) {
            return User::where('email', Str::lower($login))->first();
        }

        $id = StaffMember::cleanPf($login);

        return User::where('login_id', $id)->first()
            ?? StaffMember::where('pf_number', $id)->whereNotNull('user_id')->first()?->user;
    }

    private function domainAllowed(string $email): bool
    {
        return config('app.registration.allow_ksg_domain') && Str::endsWith($email, '@ksg.ac.ke');
    }

    private function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => [$message]]);
    }
}
