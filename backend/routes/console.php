<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Validator;

Artisan::command('admin:password {email=system.admin@ksg.ac.ke}', function (string $email) {
    $user = User::where('email', strtolower($email))->where('role', 'admin')->first();

    if (! $user) {
        $this->error("No administrator found with email {$email}.");

        return 1;
    }

    $password = $this->secret('New password (min 12 characters)');
    $confirm = $this->secret('Confirm new password');

    $validator = Validator::make(
        ['password' => $password, 'password_confirmation' => $confirm],
        ['password' => 'required|string|min:12|confirmed'],
    );

    if ($validator->fails()) {
        $this->error($validator->errors()->first());

        return 1;
    }

    $user->update(['password' => $password, 'is_active' => true]);
    $user->tokens()->delete();

    $this->info("Password updated for {$user->email}. All existing sessions were signed out.");

    return 0;
})->purpose('Reset an administrator password');
