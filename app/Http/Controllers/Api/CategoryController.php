<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkFormInput;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Jobs\ResetOptionCache;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
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

        return Category::query()->orderBy('created_at', 'desc')->where('archived', $archived)->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());
        ResetOptionCache::dispatch();
        return $category;
    }

    public function bulkStore(BulkFormInput $request){
        $bulk = $request->validated();
        $test = [];
        foreach($bulk as $index => $output){
            $test[] = Category::create(['category_name' => $output["forminputname"]]);
        }
        return response()->json([
            "Categories" => $test
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return $category;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $temp = $category->update($request->validated());
        return $temp;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return "Category Deleted";
    }
}
