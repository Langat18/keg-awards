<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('nomination_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained('users');
            $table->timestamp('created_at')->useCurrent();

            // One vote per category per cycle per voter
            $table->unique(['cycle_id', 'category_id', 'voter_id']);
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->index('cycle_id');
            $table->index('category_id');
            $table->index('voter_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
