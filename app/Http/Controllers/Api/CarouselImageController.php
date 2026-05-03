<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CarouselUpdateSelectedPositionRequest;
use App\Http\Requests\ReorderCarouselRequest;
use App\Models\CarouselImage;
use App\Http\Requests\StoreCarouselImageRequest;
use App\Http\Requests\UpdateCarouselImageRequest;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use PhpParser\Node\Expr\Cast\Bool_;

class CarouselImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $archived = false;
        if(!empty($request['archived'])){
            if($request['archived'] === "true"){
                $archived = true;
            } else{
                $archived = false;
            }
        }

        return CarouselImage::where('archived', $archived)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarouselImageRequest $request)
    {
        $validated = $request->validated();
        $file = $request->file('image');

        // $uploadFile = Cloudinary::upload($file->getRealPath(), [
        //     'folder' => 'carouselimages',
        // ])->getSecurePath();
        $uploadFile = Cloudinary::uploadApi()->upload($file->getRealPath(), [
            'folder' => 'carouselimages',
        ]);
        //$path = $file->store('', 'carouselimages');

        $carouselImage = CarouselImage::create([
            'image_name' => $validated['image_name'],
            'image_path' => $uploadFile['secure_url'],
        ]);

        return response()->json([
            'message' => 'Carousel image created successfully.',
            'carousel_image' => $carouselImage,
        ], 201);
    }

    public function updateSelected(CarouselUpdateSelectedPositionRequest $request){
        $images = CarouselImage::all()->keyBy('id');
        $bulk = $request->validated();
        foreach($bulk as $single){
            $images[$single['id']]->update([
                'is_selected' => !$single['is_selected'],
                'order_index' => $single['order_index'],
            ]);
            $images[$single['id']]->refresh();
        }

        return $images;
    }

    public function reorderCarousel(ReorderCarouselRequest $request){
        $images = CarouselImage::all()->keyBy('id');
        $bulk = $request->validated();
        foreach($bulk as $single){
            $images[$single['id']]->update([
                'order_index' => $single['order_index'],
            ]);
            $images[$single['id']]->refresh();
        }

        return $images;
    }

    /**
     * Display the specified resource.
     */
    public function show(CarouselImage $carouselImage)
    {
        return $carouselImage;
    }

    public function archiveSingle(CarouselImage $carouselImage){
        $carouselImage->update(['archived' => true]);
        $carouselImage->refresh();
        return $carouselImage;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarouselImageRequest $request, CarouselImage $carouselImage)
    {
        $validated = $request->validated();
        $file = $request->file('image');
        $path = $file->store('', 'carouselimages');

        $carouselImage->update([
            'image_name' => $validated['image_name'],
            'image_path' => $path
        ]);
        return response()->json([
            'message' => 'Carousel image updated successfully.',
            'carousel_image' => $carouselImage,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($carouselImage)
    {
        $img = CarouselImage::find($carouselImage);
        Storage::disk('carouselimages')->delete($img->image_path);
        $img->delete();
        return response()->json(["message" =>"Carousel Image Deleted"]);
    }


}
