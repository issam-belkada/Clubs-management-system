<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laudis\Neo4j\ClientBuilder;

class Neo4jServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('neo4j', function () {

            return ClientBuilder::create()
                ->withDriver(
                    'aura',                                // driver name
                    env('NEO4J_URI'),                      // Aura URI
                    auth: [
                        env('NEO4J_USERNAME'),
                        env('NEO4J_PASSWORD')
                    ]
                )
                ->build();
        });
    }

    public function boot(): void {}
}
