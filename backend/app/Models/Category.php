<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['cycle_id', 'name', 'description', 'criteria', 'sort_order'];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }

    public function nominations()
    {
        return $this->hasMany(Nomination::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
