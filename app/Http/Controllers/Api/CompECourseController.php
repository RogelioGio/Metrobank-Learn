<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompECourse;
use Illuminate\Http\Request;

class CompECourseController extends Controller
{
    public function index(){
        return CompECourse::with('category', 'lessons')->get();
    }

    public function show($course){
        return CompECourse::with('category', 'lessons')->where('id', $course)->first();
    }
}
