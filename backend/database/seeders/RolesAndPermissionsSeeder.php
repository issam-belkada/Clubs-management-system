<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',

            'view posts',
            'create posts',
            'edit posts',
            'delete posts',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $club_admin = Role::firstOrCreate(['name' => 'club_admin']);
        $club_member = Role::firstOrCreate(['name' => 'club_member']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Assign permissions to roles
        $admin->givePermissionTo(Permission::all()); // all permissions

        $club_admin->givePermissionTo([
            'view users',
            'accept memebers',
            ''
        ]);

        $user->givePermissionTo([
            'view posts'
        ]);
    }
}
