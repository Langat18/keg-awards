<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cycle extends Model
{
    protected $fillable = [
        'title', 'description', 'phase',
        'nominations_open_at', 'voting_open_at', 'results_at', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'nominations_open_at' => 'datetime',
            'voting_open_at'      => 'datetime',
            'results_at'          => 'datetime',
        ];
    }

    public function categories()
    {
        return $this->hasMany(Category::class)->orderBy('sort_order');
    }

    public function nominations()
    {
        return $this->hasMany(Nomination::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}