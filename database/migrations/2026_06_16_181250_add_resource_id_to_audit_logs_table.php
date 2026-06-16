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
        Schema::table('audit_logs', function (Blueprint $table) {
            //
                        $table->foreignId('resource_id')
                  ->nullable()
                  ->after('user_id')
                  ->constrained('resources')
                  ->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            //
                        $table->dropForeign(['resource_id']);
            $table->dropColumn('resource_id');
        });
    }
};
