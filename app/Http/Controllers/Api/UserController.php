<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Enrollment;
use App\Models\UserInfos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function addTestUser(Request $request)
    {
        // Validate incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:system_admin, course_Admin, learner',
        ]);

        // Create a new user
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),// Hash the password
            'role' => $validatedData['role']
        ]);

        // Return a success response
        return response()->json([
            'message' => 'Test user created successfully!',
            'user' => $user,
        ], 201);
    }

    public function index()
    {
        // Return a list of all users
        return response()->json(User::all());
    }

    //delete
    public function deleteUser($id)
    {
        // Find the user by id
        $user = User::find($id);

        // Check if the user exists
        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        // Delete the user
        $user->delete();

        // Return a success response
        return response()->json([
            'message' => 'User deleted successfully!',
        ], 200);
    }

    //Truncate
    public function resetUsers()
    {
        // Truncate the users table
        DB::table('users')->truncate();

        return response()->json([
            'message' => 'Users table truncated and auto-increment reset.'
        ]);
    }

    //Subject to change ung request
    public function showEnrolledCourses(Request $request){
        $enrollments = Enrollment::query()->where('user_id', $request->userId)->get();
        $courses = [];
        foreach($enrollments as $enrollment){
            $courses[] = $enrollment->Course;
        }
        return CourseResource::collection($courses);
    }
}
