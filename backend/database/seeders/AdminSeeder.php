<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'system.admin@ksg.ac.ke'],
            [
                'name'       => 'System Administrator',
                'password'   => Hash::make('KsgAdmin@2025'),
                'role'       => 'admin',
                'department' => 'ICT',
                'is_active'  => true,
            ]
        );

        $this->command->info('Admin seeded: system.admin@ksg.ac.ke / KsgAdmin@2025');
        $this->command->warn('Change the admin password immediately after first login!');
    }
}

