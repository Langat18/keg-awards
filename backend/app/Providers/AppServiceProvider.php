<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            $login = strtolower((string) $request->input('login', $request->input('email')));

            return [
                Limit::perMinute(10)->by('auth-ip:'.$request->ip()),
                Limit::perMinute(5)->by('auth-login:'.$login.'|'.$request->ip()),
            ];
        });
    }
}
