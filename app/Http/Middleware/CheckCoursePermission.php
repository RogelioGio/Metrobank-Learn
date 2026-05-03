<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckCoursePermission
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('course_permission:EditCourseDetails')
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = auth()->user();
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        $courseId = $request->route('courseId');
        if (!$courseId) {
            abort(400, 'Course ID missing');
        }

        $userInfoId = $user->userInfos->id;

        $isOwner = DB::table('zconnect_created_courses')
            ->where('id', $courseId)
            ->where('user_info_id', $userInfoId)
            ->exists();

        if ($isOwner) {
            // allow mo yung owner
            return $next($request);
        }

        $hasPermission = DB::table('zconnect_sme_permitted')
            ->join('zconnect_sme_permissions', 'zconnect_sme_permitted.PermissionsID', '=', 'zconnect_sme_permissions.id')
            ->where('zconnect_sme_permitted.PermittedID', $userInfoId)
            ->where('zconnect_sme_permitted.course_id', $courseId)
            ->where('zconnect_sme_permissions.name', $permission)
            ->exists();

        if (!$hasPermission) {
            abort(403, 'Forbidden: You do not have the required permission. hhh');
        }

        return $next($request);
    }
}
