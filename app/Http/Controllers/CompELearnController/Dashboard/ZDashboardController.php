<?php

namespace App\Http\Controllers\CompELearnController\Dashboard;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnCourseViewer;
use App\Models\Category;
use App\Models\Course;

class ZDashboardController extends Controller
{
    public function fetchAllContent(Request $request)
    {
        $limit = $request->query('limit', 12);

        $totalMatching = ZCompELearnCreatedCourse::whereNotIn('CourseStatus', ['archived', 'deleted'])->count();

        $courses = ZCompELearnCreatedCourse::whereNotIn('CourseStatus', ['archived', 'deleted'])
            ->with('category', 'careerLevel', 'courseReview')
            ->paginate($limit);

        return response()->json($courses);
    }

    public function getCounts() {
        $user = Auth::user()->load('userInfos');

        $totalCourses = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->whereNotIn('CourseStatus', ['deleted', 'archived'])->count();
        
        $ondev = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->where('CourseStatus', 'ondevelopment')->count();
        $created = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->where('CourseStatus', 'created')->count();

        $review = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->whereIn('CourseStatus', ['draft', 'for_approval'])->count();
        $reviewed = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->where('CourseStatus', 'reviewed')->count();

        $publishedCourses = ZCompELearnCreatedCourse::where('user_info_id', $user->userInfos->id)->where('CourseStatus', 'published')->count();

        return response()->json([
            'total_courses' => $totalCourses,
            'review' => $review,
            'reviewed' => $reviewed,
            'published_courses' => $publishedCourses,

            'indevelopment' => $ondev + $created,
        ], 200);
    }

    public function fetchCategoriesOfCreatedCourses($courseStatus)
    {
        $user = Auth::user()->load('userInfos');
        $role = $user->userInfos->roles[0]->role_name;

        if ($role === "SME-Approver") {

            if (in_array($courseStatus, ['approved', 'rejected'])) {
                $categories = DB::table('zconnect_course_to_be_review as review')
                    ->join('zconnect_created_courses as course', 'review.course_id', '=', 'course.id')
                    ->join('categories as category', 'course.category_id', '=', 'category.id')
                    ->select('category.id', 'category.category_name', DB::raw('COUNT(course.id) as course_count'))
                    ->where('review.user_info_id', $user->userInfos->id)
                    ->where('review.approval_status', $courseStatus)
                    ->where('course.CourseStatus', 'reviewed')
                    ->groupBy('category.id', 'category.category_name')
                    ->get();

                return response()->json($categories);
            }

            if ($courseStatus === 'pending') {
                $categories = DB::table('zconnect_course_to_be_review as review')
                    ->join('zconnect_created_courses as course', 'review.course_id', '=', 'course.id')
                    ->join('categories as category', 'course.category_id', '=', 'category.id')
                    ->select('category.id', 'category.category_name', DB::raw('COUNT(course.id) as course_count'))
                    ->where('review.user_info_id', $user->userInfos->id)
                    ->where(function($q) {
                        $q->whereNull('review.approval_status')
                        ->orWhere('review.approval_status', 'pending'); 
                    })
                    ->where('course.CourseStatus', 'draft')
                    ->groupBy('category.id', 'category.category_name')
                    ->get();

                return response()->json($categories);
            }

            $query = ZCompELearnCourseViewer::with('course.category')
                ->where('user_info_id', $user->userInfos->id);

            if ($courseStatus !== 'all') {
                $query->whereHas('course', function ($q) use ($courseStatus) {
                    $q->where('CourseStatus', $courseStatus);
                });
            }

            $categories = $query->get()
                ->groupBy(function ($item) {
                    return $item->course->category_id;
                })
                ->map(function ($courses) {
                    return [
                        'id' => $courses->first()->course->category->id ?? null,
                        'category_name' => $courses->first()->course->category->category_name ?? 'Unknown',
                        'course_count' => $courses->count(),
                    ];
                })
                ->values();

            return response()->json($categories);
        }

        if ($courseStatus === "published" && $role === "SME-Distributor") {
            $categories = ZCompELearnCreatedCourse::with('category')
                ->where('CourseStatus', 'published')
                ->get()
                ->groupBy('category_id')
                ->map(function ($courses) {
                    return [
                        'id' => $courses->first()->category->id,
                        'category_name' => $courses->first()->category->category_name,
                        'course_count' => $courses->count(),
                    ];
                })
                ->values();

            return response()->json($categories);
        }

        $query = ZCompELearnCreatedCourse::with('category')
            ->where('user_info_id', $user->userInfos->id);

        if ($courseStatus !== 'all') {
            $query->where('CourseStatus', $courseStatus);
        }

        $categories = $query->get()
            ->groupBy('category_id')
            ->map(function ($courses) {
                return [
                    'id' => $courses->first()->category->id,
                    'category_name' => $courses->first()->category->category_name,
                    'course_count' => $courses->count(),
                ];
            })
            ->values();

        return response()->json($categories);
    }


    public function fetchCategoriesOfSharedCourses($courseStatus)
    {
        $user = Auth::user()->load('userInfos');
        $userInfoId = $user->userInfos->id;

        $query = ZCompELearnCreatedCourse::with('category')
            ->whereHas('smePermitted', function ($q) use ($userInfoId) {
                $q->where('PermittedID', $userInfoId);
            })
            ->where(function ($q) {
                $q->whereIn('CourseStatus', ['created', 'ondevelopment'])
                    ->orWhere(function ($q) {
                        $q->where('CourseStatus', 'reviewed')
                            ->whereHas('courseReview', function ($qr) {
                                $qr->where('approval_status', 'rejected');
                            });
                    });
            });

        if ($courseStatus !== 'all') {
            $query->where('CourseStatus', $courseStatus);
        }

        $categories = $query->get()
            ->groupBy('category_id')
            ->map(function ($courses) {
                return [
                    'id' => $courses->first()->category->id ?? null,
                    'category_name' => $courses->first()->category->category_name ?? 'Uncategorized',
                    'course_count' => $courses->count(),
                ];
            })
            ->filter(fn($category) => $category['id'] !== null)
            ->values();

        return response()->json($categories);
    }





    /// --------------------
    /// Viewer Dashboard
    /// --------------------
    public function getCourseReviewStatus()
    {
        $user = Auth::user()->load('userInfos');


        $toBeReviewed = ZCompELearnCourseViewer::where('user_info_id', $user->userInfos->id)
                        ->where('approval_status', 'pending')
                        ->get();

        $approved = ZCompELearnCourseViewer::where('user_info_id', $user->userInfos->id)
                        ->where('approval_status', 'approved')
                        ->whereHas('course', function ($query) {
                            $query->whereIn('CourseStatus', ['reviewed', 'draft', 'distributed']);
                        })
                        ->get();

        $rejected = ZCompELearnCourseViewer::where('user_info_id', $user->userInfos->id)
                        ->where('approval_status', 'rejected')
                        ->whereHas('course', function ($query) {
                            $query->whereIn('CourseStatus', ['reviewed', 'draft', 'distributed']);
                        })
                        ->get();

        $published = ZCompELearnCourseViewer::where('user_info_id', $user->userInfos->id)
            ->where('approval_status', 'approved')
            ->whereHas('course', function ($query) {
                $query->where('CourseStatus', 'published');
            })
            ->with('course')
            ->get()
            ->map(fn($viewer) => $viewer->course);


        return response()->json([
            'toBeReviewed' => $toBeReviewed,
            'approved' => $approved,
            'rejected' => $rejected,
            'published' => $published,
        ]);
    }

    /// --------------------
    /// Distributor Dashboard
    /// --------------------

    public function getCourseDistributionStatus()
    {
        $publishedCourse = ZCompELearnCreatedCourse::where('CourseStatus', 'published')->get();
        $distributedCourse = ZCompELearnCreatedCourse::where('CourseStatus', 'distributed')->get();

        return response()->json([
            'published' => $publishedCourse,
            'distributed' => $distributedCourse,
        ]);
    }

    public function fetchCategoriesOfCourses()
    {
        $categories = Category::select('categories.id', 'categories.category_name')
            ->leftJoin('zconnect_created_courses', function ($join) {
                $join->on('categories.id', '=', 'zconnect_created_courses.category_id')
                    ->where('zconnect_created_courses.CourseStatus', '=', 'published');
            })
            ->selectRaw('COUNT(zconnect_created_courses.id) as courses_count')
            ->groupBy('categories.id', 'categories.category_name')
            ->get();

        return response()->json($categories);
    }

    public function fetchAllDistributedCourses(Request $request)
    {
        $courses = ZCompELearnCreatedCourse::where('CourseStatus', 'published')
            ->with('category', 'careerLevel', 'courseReview')
            ->get();  // <- use get() instead of paginate()

        return response()->json($courses);
    }
}
