<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    //
    protected $fillable = [
        'ward_id',
        'name', 
        'quantity', 
        'status'
        ];
        
        public function ward()
        {
            return $this->belongsTo(Ward::class);
        }
}
