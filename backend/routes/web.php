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
Route::get('/setup-admin/{token}', function (string $token) {
    if (! hash_equals(env('ADMIN_SETUP_TOKEN', ''), $token)) {
        abort(404);
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