<?php

namespace App\Http\Api\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CourseModules;
use App\Http\Requests\StoreCourseModulesRequest;
use App\Http\Requests\UpdateCourseModulesRequest;

class CourseModulesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseModulesRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseModules $courseModules)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CourseModules $courseModules)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseModulesRequest $request, CourseModules $courseModules)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseModules $courseModules)
    {
        //
    }
}
