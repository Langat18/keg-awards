<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePasswordIsChanged
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->must_change_password) {
            return response()->json([
                'message' => 'Choose your own password before continuing.',
                'code' => 'password_change_required',
            ], 403);
        }

        return $next($request);
    }
}
