<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/run-migrations/{token}', function (string $token) {
    $expected = (string) config('app.setup_token');

    if ($expected === '' || ! hash_equals($expected, $token)) {
        abort(404);
    }

    try {
        $exitCode = Artisan::call('migrate', ['--force' => true]);

        return response()->json([
            'exit_code' => $exitCode,
            'output' => Artisan::output(),
        ]);
    } catch (\Throwable $e) {
        report($e);

        return response()->json(['error' => true, 'message' => 'Migration failed. Check the logs.'], 500);
    }
})->middleware('throttle:5,1');
