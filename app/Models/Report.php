<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Report extends Model
{
    //
    protected $fillable = [
        'hospital_id',
        'generated_by',
        'period_start',
        'period_end',
        'content',
        'generated_at'
    ];

    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'generated_by');
}
}