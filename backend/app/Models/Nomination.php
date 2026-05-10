<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nomination extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'cycle_id', 'category_id', 'nominee_id', 'nominated_by', 'reason', 'created_at',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function nominee()
    {
        return $this->belongsTo(User::class, 'nominee_id');
    }

    public function nominator()
    {
        return $this->belongsTo(User::class, 'nominated_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
