<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class Neo4j extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'neo4j'; // same name used in the service provider
    }
}
