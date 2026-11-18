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
        'login_id',
        'password',
        'must_change_password',
        'department',
        'role',
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
            'password' => 'hashed',
            'is_active' => 'boolean',
            'can_view_results' => 'boolean',
            'must_change_password' => 'boolean',
        ];
    }

    public function staffMember()
    {
        return $this->hasOne(StaffMember::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function canViewResults(): bool
    {
        return $this->isAdmin() || $this->can_view_results;
    }
}