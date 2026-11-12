<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'Your account has been deactivated. Contact the administrator.'], 401);
        }

        return $next($request);
    }
}
