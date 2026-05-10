<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cycles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->enum('phase', ['closed', 'nominating', 'voting', 'results'])->default('closed');
            $table->timestamp('nominations_open_at')->nullable();
            $table->timestamp('voting_open_at')->nullable();
            $table->timestamp('results_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Only one cycle in nominating or voting at a time
        DB::statement("CREATE UNIQUE INDEX idx_one_active_cycle
            ON cycles (phase) WHERE phase IN ('nominating', 'voting')");
    }

    public function down(): void
    {
        Schema::dropIfExists('cycles');
    }
};