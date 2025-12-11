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
        Schema::create('clubs', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->text('logo_url')->nullable();
            $table->string('contact_email')->unique();
            $table->string('contact_phone')->nullable();
            $table->string('website_url')->nullable();
            $table->string('social_media_links')->nullable();
            $table->string('location')->nullable();
            $table->date('established_date')->nullable();
            $table->string('border_image')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clubs');
    }
};
