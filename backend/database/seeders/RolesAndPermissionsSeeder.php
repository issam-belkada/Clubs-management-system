<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions (unique, corrected spelling)
        $permissions = [
            'view users',
            'assign roles',

            'create clubs',
            'edit clubs',
            'delete clubs',

            'see members',
            'accept members',
            'remove members',

            'create events',
            'edit events',
            'delete events',

            'create posts',
            'edit posts',
            'delete posts',
            'view posts',

            'create projects',
            'edit projects',
            'delete projects',

            'create tasks',
            'edit tasks',
            'delete tasks',

            'create resources',
            'edit resources',
            'delete resources',

            'review club submissions',
            'review event submissions',

            'mark attendance',
            'view attendance',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $club_admin = Role::firstOrCreate(['name' => 'club_admin']);
        $club_member = Role::firstOrCreate(['name' => 'club_member']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Assign permissions
        // Give admin all permissions
        $admin->givePermissionTo(Permission::all());

        $club_admin->givePermissionTo([
            'view users',
            'accept members',
            'remove members',
            'edit clubs',
            'delete clubs',
            'create events',
            'edit events',
            'delete events',
            'create posts',
            'edit posts',
            'delete posts',
            'create projects',
            'edit projects',
            'delete projects',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'create resources',
            'edit resources',
            'delete resources',
            'see members',
            'review club submissions',
            'review event submissions',
            'mark attendance',
            'view attendance',
        ]);

        $club_member->givePermissionTo([
            'create posts',
            'create tasks',
            'view posts',
            'mark attendance',
            'review event submissions',
            'view attendance',
        ]);

        $user->givePermissionTo([
            'view posts',
        ]);
        
    }
}
