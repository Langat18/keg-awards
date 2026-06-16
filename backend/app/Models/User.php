<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'department',
        'is_admin',
        'is_active',
        'can_view_results', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password'         => 'hashed',
            'is_admin'         => 'boolean',
            'is_active'        => 'boolean',
            'can_view_results' => 'boolean',  // NEW
        ];
    }

    /** Admins and explicitly granted users can view results. */
    public function canViewResults(): bool
    {
        return $this->is_admin || $this->can_view_results;
    }
}