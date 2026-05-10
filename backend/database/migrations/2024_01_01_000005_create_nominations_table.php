<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('nominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('nominee_id')->constrained('users');
            $table->foreignId('nominated_by')->constrained('users');
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // One nomination per nominee per category per cycle
            $table->unique(['cycle_id', 'category_id', 'nominee_id']);
        });

        Schema::table('nominations', function (Blueprint $table) {
            $table->index('cycle_id');
            $table->index('category_id');
            $table->index('nominee_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nominations');
    }
};
