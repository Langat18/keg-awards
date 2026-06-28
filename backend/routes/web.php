<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/run-migrations/{token}', function (string $token) {
    if (! hash_equals(env('ADMIN_SETUP_TOKEN', ''), $token)) {
        abort(404);
    }

    try {
        $exitCode = Artisan::call('migrate', ['--force' => true]);

        return response()->json([
            'exit_code' => $exitCode,
            'output' => Artisan::output(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => true,
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});