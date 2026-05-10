<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'cycle_id', 'category_id', 'nomination_id', 'voter_id', 'created_at',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function nomination()
    {
        return $this->belongsTo(Nomination::class);
    }

    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

