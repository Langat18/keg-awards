<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin.email');

        if (User::where('email', $email)->exists()) {
            $this->command->info("Admin {$email} already exists. Use `php artisan admin:password` to reset the password.");

            return;
        }

        $configured = config('app.admin.password');
        $password = $configured ?: Str::password(16);

        User::create([
            'name' => 'System Administrator',
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
            'department' => 'ICT',
            'is_active' => true,
        ]);

        $this->command->info("Admin created: {$email}");

        if (! $configured) {
            $this->command->warn("Generated password: {$password}");
            $this->command->warn('Store it somewhere safe. It will not be shown again.');
        }
    }
}
