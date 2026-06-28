<?php

use Illuminate\Support\Facades\Route;

use App\Models\User;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test123', fn () => response('PHP IS REACHABLE', 200));
Route::get('/test123/{anything}', fn (string $anything) => response("GOT: $anything", 200));
Route::get('/debug-routes', function () {
    $cacheFile = base_path('bootstrap/cache/routes-v7.php');
    return response()->json([
        'route_cache_exists' => file_exists($cacheFile),
        'route_cache_path' => $cacheFile,
        'all_registered_routes' => collect(\Illuminate\Support\Facades\Route::getRoutes())->map(fn($r) => $r->uri())->values(),
    ]);
});
Route::get('/debug-token', function () {
    return response()->json([
        'token_value' => env('ADMIN_SETUP_TOKEN'),
        'token_length' => strlen(env('ADMIN_SETUP_TOKEN', '')),
    ]);
});
Route::get('/setup-admin/{token}', function (string $token) {
    $expected = env('ADMIN_SETUP_TOKEN', '');

    if ($expected !== $token) {
        return response()->json([
            'match' => false,
            'expected_length' => strlen($expected),
            'received_length' => strlen($token),
            'expected' => $expected,
            'received' => $token,
        ]);
    }

    if (User::where('role', 'admin')->exists()) {
        return response('An admin user already exists. This route is now disabled.', 403);
    }

    User::create([
        'name' => 'System Admin',
        'email' => 'admin@ksg.ac.ke',
        'password' => bcrypt('Admin@123'),
        'role' => 'admin',
        'is_active' => true,
    ]);

    return response('Admin user created. Log in and change the password immediately, then remove this route.');
});