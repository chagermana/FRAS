<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    //
    protected $fillable = [
        'name', 
        'hospital_id'
        ];
        
        public function hospital()
        {
            return $this->belongsTo(Hospital::class);
        }

        public function resources()
        {
            return $this->hasMany(Resource::class);
        }

        public function users()
        {
            return $this->hasMany(User::class);
        }
}
