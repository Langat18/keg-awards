<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StaffMember extends Model
{
    protected $fillable = ['name', 'department', 'email', 'pf_number', 'user_id', 'left_at'];

    protected function casts(): array
    {
        return ['left_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loginId(): string
    {
        return sprintf('KSG-%04d', $this->id);
    }

    public function hasLeft(): bool
    {
        return $this->left_at !== null;
    }

    public static function cleanName(?string $value): ?string
    {
        $value = trim(preg_replace('/\s+/u', ' ', (string) $value));

        return $value === '' ? null : $value;
    }

    public static function cleanEmail(?string $value): ?string
    {
        $value = Str::lower(trim((string) $value));

        return $value === '' ? null : $value;
    }

    public static function cleanPf(?string $value): ?string
    {
        $value = Str::upper(preg_replace('/\s+/u', '', (string) $value));

        return $value === '' ? null : $value;
    }

    public static function temporaryPassword(): string
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $pick = fn () => $alphabet[random_int(0, strlen($alphabet) - 1)];

        return implode('', array_map(fn () => $pick(), range(1, 5))).'-'.implode('', array_map(fn () => $pick(), range(1, 5)));
    }
}
