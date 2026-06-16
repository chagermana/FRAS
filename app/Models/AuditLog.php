<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    //
    protected $fillable = [
        'user_id',
        'resource_id',
        'old_status',
        'new_status',
        'changed_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }
}
