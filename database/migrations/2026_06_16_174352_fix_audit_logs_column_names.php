<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        
            Schema::table('audit_logs', function (Blueprint $table) {
        $table->renameColumn('old status', 'old_status');
        $table->renameColumn('new status', 'new_status');
        $table->renameColumn('changed at', 'changed_at');
    });
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
