<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_ksg_email');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 150)->nullable()->change();
            $table->string('login_id', 20)->nullable()->unique()->after('email');
            $table->boolean('must_change_password')->default(false)->after('password');
        });

        Schema::create('staff_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('department', 150)->nullable();
            $table->string('email', 150)->nullable()->unique();
            $table->string('pf_number', 50)->nullable()->unique();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();
        });

        $staff = DB::table('users')->where('role', 'staff')->orderBy('id')->get();

        foreach ($staff as $user) {
            $id = DB::table('staff_members')->insertGetId([
                'name' => $user->name,
                'department' => $user->department,
                'email' => $user->email ? strtolower($user->email) : null,
                'user_id' => $user->id,
                'created_at' => $user->created_at ?? now(),
                'updated_at' => now(),
            ]);

            DB::table('users')->where('id', $user->id)->update(['login_id' => sprintf('KSG-%04d', $id)]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_members');

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['login_id']);
            $table->dropColumn(['login_id', 'must_change_password']);
        });
    }
};
