<?php

namespace App\Http\Api\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProfileImage;
use App\Http\Requests\StoreProfileImageRequest;
use App\Http\Requests\UpdateProfileImageRequest;
use Illuminate\Support\Facades\Storage;

class ProfileImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ProfileImage::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProfileImageRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProfileImage $profileImage)
    {
        return $profileImage;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProfileImageRequest $request, ProfileImage $profileImage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProfileImage $profileImage)
    {
        $profileImage->delete();
        Storage::disk('public')->delete($profileImage->image_path);
        return response()->json([
            'message' => "Profile Images deleted"
        ]);
    }
}
