<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Permanently enforce the Master System Admin account
        User::updateOrCreate(
            ['email' => 'admin@fras.com'], // Unique identifier check
            [
                'name' => 'Master System Admin',
                'password' => bcrypt('password123'), // Default secure local development password
                'role' => 'system_admin',
                'status' => 'approved', // Bypasses the pending registration filter entirely
                'hospital_id' => null,  // System admins oversee all facilities
            ]
        );

        // 2. Call your other existing seeders below if you have any
        // $this->call([
        //     HospitalSeeder::class,
        //     WardSeeder::class,
        // ]);
    }
}
