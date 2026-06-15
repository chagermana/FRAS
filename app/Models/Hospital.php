<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    //
    protected $fillable = [
        'name', 
        'location', 
        'county'
        ];
        
        public function wards()
        {
            return $this->hasMany(Ward::class);
        }

        public function users()
        {
            return $this->hasMany(User::class);
        }
}


