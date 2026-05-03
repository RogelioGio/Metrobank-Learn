<?php

namespace App\Http\Controllers;

use App\Models\LessonFile;
use App\Http\Requests\StoreLessonFileRequest;
use App\Http\Requests\UpdateLessonFileRequest;

class LessonFileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonFileRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(LessonFile $lessonFile)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLessonFileRequest $request, LessonFile $lessonFile)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LessonFile $lessonFile)
    {
        //
    }
}
