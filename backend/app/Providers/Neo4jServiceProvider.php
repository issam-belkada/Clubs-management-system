<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laudis\Neo4j\ClientBuilder;
use Laudis\Neo4j\Authentication\Authenticate;

class Neo4jServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('neo4j', function () {
            return ClientBuilder::create()
                ->withDriver(
                    'aura',                                // driver name
                    env('NEO4J_URI'),                      // Aura URI
                    authentication: Authenticate::basic(                    // use Authenticate object
                        env('NEO4J_USERNAME'),
                        env('NEO4J_PASSWORD')
                    )
                )
                ->build();
        });
    }

    public function boot(): void {}
}
