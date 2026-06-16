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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('hospital_id')
          ->constrained()
          ->cascadeOnDelete();

          $table->foreignId('generated_by')
          ->constrained('users')
          ->cascadeOnDelete();

            $table->date('period_start');
            $table->date('period_end');
            $table->longText('content');
            $table->timestamp('generated_at');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
