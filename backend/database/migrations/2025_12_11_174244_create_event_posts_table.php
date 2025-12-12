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
        Schema::create('event_posts', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->text('content');
            $table->string('post_title')->nullable();
            $table->string('post_description')->nullable();
            $table->string('post_image')->nullable();
            $table->string('post_image2')->nullable();
            $table->string('post_image3')->nullable();
            $table->string('post_image4')->nullable();
            $table->string('post_video')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_posts');
    }
};
