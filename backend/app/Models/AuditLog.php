<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'target_type', 'target_id', 'notes', 'created_at',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(User $actor, string $action, ?Model $target = null, ?string $notes = null): self
    {
        return static::create([
            'user_id' => $actor->id,
            'action' => $action,
            'target_type' => $target ? strtolower(class_basename($target)) : null,
            'target_id' => $target?->getKey(),
            'notes' => $notes,
            'created_at' => now(),
        ]);
    }
}
