<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\StaffMember;
use App\Models\User;
use App\Support\StaffImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index()
    {
        return StaffMember::with('user:id,email,login_id,is_active,must_change_password')
            ->orderBy('name')
            ->get()
            ->map(fn (StaffMember $s) => $this->present($s));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $member = StaffMember::create($data);

        if ($member->email) {
            $user = User::where('email', $member->email)->where('role', 'staff')->doesntHave('staffMember')->first();
            $user && $member->update(['user_id' => $user->id]);
        }

        AuditLog::record($request->user(), 'staff_added', $member, $member->name);

        return response()->json($this->present($member->load('user')), 201);
    }

    public function update(Request $request, StaffMember $staff)
    {
        $staff->update($this->validated($request, $staff));

        AuditLog::record($request->user(), 'staff_updated', $staff, $staff->name);

        return response()->json($this->present($staff->load('user')));
    }

    public function toggleLeft(Request $request, StaffMember $staff)
    {
        $leaving = ! $staff->hasLeft();

        DB::transaction(function () use ($staff, $leaving) {
            $staff->update(['left_at' => $leaving ? now() : null]);

            if ($staff->user) {
                $staff->user->update(['is_active' => ! $leaving]);
                $leaving && $staff->user->tokens()->delete();
            }
        });

        AuditLog::record($request->user(), $leaving ? 'staff_left' : 'staff_returned', $staff, $staff->name);

        return response()->json($this->present($staff->fresh('user')));
    }

    public function destroy(Request $request, StaffMember $staff)
    {
        if ($staff->user_id) {
            return response()->json([
                'message' => "{$staff->name} already has an account. Mark them as having left instead.",
            ], 422);
        }

        AuditLog::record($request->user(), 'staff_removed', $staff, $staff->name);
        $staff->delete();

        return response()->json(['message' => 'Removed from the staff list.']);
    }

    public function createAccounts(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'integer',
        ]);

        $members = StaffMember::whereIn('id', $data['ids'])
            ->whereNull('user_id')
            ->whereNull('left_at')
            ->orderBy('name')
            ->get();

        if ($members->isEmpty()) {
            return response()->json(['message' => 'Everyone selected already has an account or has left.'], 422);
        }

        $credentials = DB::transaction(fn () => $members->map(function (StaffMember $member) {
            $password = StaffMember::temporaryPassword();
            $emailFree = $member->email && ! User::where('email', $member->email)->exists();

            $user = User::create([
                'name' => $member->name,
                'department' => $member->department,
                'email' => $emailFree ? $member->email : null,
                'login_id' => $member->loginId(),
                'password' => $password,
                'must_change_password' => true,
                'role' => 'staff',
                'is_active' => true,
            ]);

            $member->update(['user_id' => $user->id]);

            return [
                'name' => $user->name,
                'department' => $user->department,
                'email' => $user->email,
                'login_id' => $user->login_id,
                'password' => $password,
            ];
        }));

        AuditLog::record($request->user(), 'accounts_created', null, $members->pluck('name')->join(', '));

        return response()->json(['credentials' => $credentials->values()], 201);
    }

    public function preview(Request $request)
    {
        return response()->json($this->importer($request)->analyse());
    }

    public function import(Request $request)
    {
        $request->validate([
            'include_lines' => 'array',
            'include_lines.*' => 'integer',
        ]);

        $result = $this->importer($request)->apply($request->input('include_lines', []));

        AuditLog::record(
            $request->user(),
            'staff_imported',
            null,
            "{$result['added']} added, {$result['updated']} updated, {$result['left']} marked as left",
        );

        return response()->json($result);
    }

    private function importer(Request $request): StaffImport
    {
        $request->validate([
            'rows' => 'required|array|min:1|max:5000',
            'rows.*' => 'array',
            'mark_missing_as_left' => 'boolean',
        ], [
            'rows.required' => 'The file has no rows to import.',
            'rows.max' => 'Import at most 5,000 people at a time.',
        ]);

        return new StaffImport($request->input('rows'), $request->boolean('mark_missing_as_left'));
    }

    private function validated(Request $request, ?StaffMember $staff = null): array
    {
        $request->merge([
            'name' => StaffMember::cleanName($request->input('name')),
            'department' => StaffMember::cleanName($request->input('department')),
            'email' => StaffMember::cleanEmail($request->input('email')),
            'pf_number' => StaffMember::cleanPf($request->input('pf_number')),
        ]);

        return $request->validate([
            'name' => 'required|string|max:150',
            'department' => 'nullable|string|max:150',
            'email' => ['nullable', 'email', 'max:150', Rule::unique('staff_members')->ignore($staff)],
            'pf_number' => ['nullable', 'string', 'max:50', Rule::unique('staff_members')->ignore($staff)],
        ], [
            'email.unique' => 'Someone on the staff list already has this email.',
            'pf_number.unique' => 'Someone on the staff list already has this PF number.',
        ]);
    }

    private function present(StaffMember $s): array
    {
        return [
            'id' => $s->id,
            'name' => $s->name,
            'department' => $s->department,
            'email' => $s->email,
            'pf_number' => $s->pf_number,
            'login_id' => $s->user?->login_id,
            'status' => $s->hasLeft() ? 'left' : ($s->user_id ? 'registered' : 'pending'),
            'left_at' => $s->left_at,
            'account' => $s->user ? [
                'id' => $s->user->id,
                'email' => $s->user->email,
                'is_active' => $s->user->is_active,
                'must_change_password' => $s->user->must_change_password,
            ] : null,
        ];
    }
}
