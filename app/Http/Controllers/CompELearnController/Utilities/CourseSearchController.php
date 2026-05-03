<?php

namespace App\Http\Controllers\CompELearnController\Utilities;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnCourseViewer;
use App\Models\UserInfos;

class CourseSearchController extends Controller
{
  public function searchContentHubCourses(Request $request)
  {
    $user = Auth::user()->load('userInfos');
    $userInfoId = $user->userInfos->id;

    $search = $request->input('search');
    $option = $request->input('option');
    $temp = '%' . $search . '%';

    \Log::info('Search input:', ['search' => $search, 'option' => $option]);

    $searchedCourses = ZCompELearnCreatedCourse::query()
      ->when($option === 'all', function ($query) use ($userInfoId) {
          $query->where('user_info_id', $userInfoId)
              ->whereIn('CourseStatus', ['created', 'ondevelopment', 'for_approval']);
      })
      ->when($option === 'shared', function ($query) use ($userInfoId) {
          $query->whereHas('smePermitted', function ($q) use ($userInfoId) {
              $q->where('PermittedID', $userInfoId);
          })
          ->where(function($q) {
              $q->whereIn('CourseStatus', ['created', 'ondevelopment', 'for_approval'])
                  ->orWhere(function($q) {
                      $q->where('CourseStatus', 'reviewed')
                        ->whereHas('courseReview', function($qr) {
                            $qr->where('approval_status', 'rejected');
                        });
                  });
          });
      })
      ->when($search, function ($query, $search) use ($temp) {
          $query->where(function ($q) use ($temp) {
              $q->where('CourseName', 'ilike', $temp)
                  ->orWhere('CourseID', 'like', $temp)
                  ->orWhereHas('category', fn($q) => $q->where('category_name', 'like', $temp))
                  ->orWhereHas('careerLevel', fn($q) => $q->where('name', 'like', $temp));
          });
      })
      ->with(['division', 'careerLevel', 'category', 'userInfo', 'certificates:id,course_id', 'courseReview'])
      ->withCount(['lessons as module_count', 'tests as test_count', 'certificates as certificate_count'])
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json($searchedCourses, 200);
  }

  public function searchDashboardCourses(Request $request)
  {
      $search = $request->input('search');
      $temp = '%' . $search . '%';

      $searchedCourses = ZCompELearnCreatedCourse::whereNotIn('CourseStatus', ['archived', 'deleted'])
          ->when($search, function($query, $search) {
              $temp = '%' . $search . '%';
              $query->where(function ($q) use ($temp) {
                  $q->where('CourseName', 'ilike', $temp)
                    ->orWhere('CourseID', 'like', $temp)
                    ->orWhereHas('category', fn($q) => $q->where('category_name', 'like', $temp))
                    ->orWhereHas('careerLevel', fn($q) => $q->where('name', 'like', $temp));
              });
          })
          ->with(['category', 'careerLevel'])
          ->get();

      return response()->json($searchedCourses, 200);
  }

  public function searchContentBankCoursesCreator(Request $request)
  {
    $user = Auth::user()->load('userInfos');
    $search = $request->input('search');
    $courseStatus = $request->input('status');

    $temp = '%' . $search . '%';

    $query = ZCompELearnCreatedCourse::query()
            ->where('user_info_id', $user->userInfos->id)
            ->where('CourseName', 'ilike', $temp);

    if ($courseStatus) {
      if ($courseStatus === 'draft') {
          $query->whereIn('CourseStatus', ['draft']);
      } else if ($courseStatus === 'reviewed') {
          $query->whereIn('CourseStatus', ['reviewed']);
      } else if ($courseStatus === 'published') {
          $query->whereIn('CourseStatus', ['published']);
      } else if ($courseStatus === 'archived') {
          $query->where('CourseStatus', $courseStatus);
      } else if ($courseStatus === 'deleted') {
        $query->where('CourseStatus', 'deleted');
      }
    }

    $searchCourses = $query
      ->with('category')
      ->get();
    return response()->json($searchCourses);
  }
  public function searchContentBankCoursesViewer(Request $request)
  {
      $user = Auth::user()->load('userInfos');
      $role = $user->userInfos->roles[0]->role_name ?? null;
      $search = $request->input('search', '');
      $courseStatus = $request->input('status', 'all');
      $temp = '%' . $search . '%';

      if (in_array($courseStatus, ['pending', 'approved', 'rejected'])) {
          $query = DB::table('zconnect_course_to_be_review as review')
            ->join('zconnect_created_courses as course', 'review.course_id', '=', 'course.id')
            ->join('categories as category', 'course.category_id', '=', 'category.id')
            ->where('review.user_info_id', $user->userInfos->id)
            ->where('review.approval_status', $courseStatus)
            ->where('course.CourseName', 'ilike', $temp);

          if (in_array($courseStatus, ['approved', 'rejected'])) {
              $query->where('course.CourseStatus', 'reviewed');
          }

          if ($courseStatus === 'approved') {
              $query->where('course.CourseStatus', '!=', 'published');
          }

      } elseif ($courseStatus === 'published') {
          $query = DB::table('zconnect_created_courses as course')
            ->join('zconnect_course_to_be_review as review', 'course.id', '=', 'review.course_id')
            ->join('categories as category', 'course.category_id', '=', 'category.id')
            ->where('course.CourseStatus', 'published')
            ->where('review.user_info_id', $user->userInfos->id)
            ->where('course.CourseName', 'ilike', $temp);
      } else {
          $query = DB::table('zconnect_course_to_be_review as review')
            ->join('zconnect_created_courses as course', 'review.course_id', '=', 'course.id')
            ->join('categories as category', 'course.category_id', '=', 'category.id')
            ->where('review.user_info_id', $user->userInfos->id)
            ->where('course.CourseName', 'ilike', $temp);
      }

      $searchCourses = $query
          ->select('course.*', 'category.category_name', 'review.approval_status')
          ->get();

      return response()->json($searchCourses);
  }


  public function searchViewerCourses(Request $request)
  {
    $user = Auth::user()->load('userInfos');
    $search = $request->input('search');
    
    $temp = '%' . $search . '%';
    
    $query = ZCompELearnCreatedCourse::query()
            ->where('CourseName', 'ilike', $temp)
            ->where('CourseStatus', 'draft');

    $searchedCourses = $query->get();

    return response()->json($searchedCourses, 200);
  }

  public function searchSMEAvailableViewers(Request $request)
  {
      $search = $request->input('search');
      $temp = "%" . $search . "%";

      $query = UserInfos::whereHas('roles', function($query) {
          $query->where('role_name', 'SME-Approver');
      })
      ->with(['userCredentials'])
      ->where('status', 'Active');

      if ($search) {
          $query->where(function ($q) use ($temp) {
              $q->where('first_name', 'ilike', $temp)
                ->orWhere('middle_name', 'ilike', $temp)
                ->orWhere('last_name', 'ilike', $temp);
          });
      }

      $viewers = $query->get();

      return response()->json($viewers, 200);
  }
}