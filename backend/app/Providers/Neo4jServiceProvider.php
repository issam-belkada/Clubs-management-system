<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laudis\Neo4j\ClientBuilder;

class Neo4jServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('neo4j', function () {
            return ClientBuilder::create()
                ->withDriver(
                    env('NEO4J_SCHEME', 'bolt'),
                    env('NEO4J_SCHEME') . '://' .
                    env('NEO4J_USERNAME') . ':' .
                    env('NEO4J_PASSWORD') . '@' .
                    env('NEO4J_HOST') . ':' .
                    env('NEO4J_PORT')
                )
                ->build();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
