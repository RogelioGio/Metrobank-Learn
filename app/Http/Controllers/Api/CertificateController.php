<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddExternalCertificateRequest;
use App\Models\Certificate;
use App\Models\certificate_userinfo;
use App\Models\UserInfos;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function getCertificates(UserInfos $user, string $type, Request $request){

        $perPage = $request->input('perPage', 6);   // default per page
        $page = $request->input('page', 1);

        if($type === "false"){
            $certificate = $user->certificateRelation()->with(
                'certificate',
                'certificate.course',
                'certificate.course.lessons',
                'certificate.course.attachments',
                'certificate.course.tests',
                'certificate.course.tests.questions',
                'certificate.course.categories',
                'certificate.course.career_level',
                'certificate.course.author',
                'certificate.course.author.userCredentials'
            )->where('external_certificate',false)
            ->where('archived', false)->paginate($perPage);
        } else if ($type === 'archived') {
            $certificate = $user->certificateRelation()->with(
                'certificate',
                'certificate.course',
                'certificate.course.lessons',
                'certificate.course.attachments',
                'certificate.course.tests',
                'certificate.course.tests.questions',
                'certificate.course.categories',
                'certificate.course.career_level',
                'certificate.course.author',
                'certificate.course.author.userCredentials'
            )->where('archived',true)->paginate($perPage);
        } else{
            $certificate = $user->certificateRelation()->with(
                'certificate',
                'certificate.course',
                'certificate.course.lessons',
                'certificate.course.attachments',
                'certificate.course.tests',
                'certificate.course.tests.questions',
                'certificate.course.categories',
                'certificate.course.career_level',
                'certificate.course.author',
                'certificate.course.author.userCredentials'
            )->where('external_certificate',true)->paginate($perPage);
        }


        return response()->json([
            'data' => $certificate->items(),
            'total' => $certificate->total(),
            'last_page' => $certificate->lastPage(),
            'currentPage' => $certificate->currentPage()
        ]);
    }

    public function addExternalCertificate(AddExternalCertificateRequest $request){
        $name = $request->query('external_certificate_name');
        $file = $request->file('external_certificate');
        $path = "";
        if(!$file){
            return response()->json(['message' => 'Certificate not saved']);
        }
        $existing = certificate_userinfo::where('external_certificate_name', $name)->first();
        if($existing){
            return response()->json([
                "message" => "The name $name is already being used, please use another file name"
            ], 400);
        }

        $path = $file->store('certificates', 'public');

        $excert = certificate_userinfo::create([
            'user_id' => $request->user()->userInfos->id,
            'external_certificate' => (bool) true,
            'outside_certificate_url' => $path,
            'external_certificate_name' => $name
        ]);

        return response()->json([
            'message' => 'Certificate Saved',
            'external certificate' => $excert
        ]);
    }

    public function searchCertificates(Request $request){
        $user = $request->user()->userInfos;
        $query = $request->query('q');
        $perPage = $request->input('perPage', 6);   // default per page
        $page = $request->input('page', 1);
        $type = filter_var($request->query('type'), FILTER_VALIDATE_BOOLEAN);

        $results = $user->certificateRelation()->with(
            'certificate',
            'certificate.course',
            'certificate.course.lessons',
            'certificate.course.attachments',
            'certificate.course.tests',
            'certificate.course.tests.questions',
            'certificate.course.categories',
            'certificate.course.career_level',
            'certificate.course.author',
            'certificate.course.author.userCredentials'
        )->where('external_certificate', $type)
        ->where(function($q) use ($query){
            $q->where('external_certificate_name', 'ILIKE', "%{$query}%")
            -> orWhereHas('certificate', function ($q) use ($query) {
            $q->where('CertificateName', 'ILIKE', "%{$query}%") // search certificate name
                ->orWhereHas('course', function ($courseQuery) use ($query) {
                    $courseQuery->where('courseName', 'ILIKE', "%{$query}%")
                                ->orWhere('courseID', 'ILIKE', "%{$query}%"); // search course fields
                });
        });
        })
        ->paginate($perPage);

        return response()->json([
            'data' => $results->items(),
            'total' => $results->total(),
            'last_page' => $results->lastPage(),
            'currentPage' => $results->currentPage()
        ]);
    }

    public function destroyExternalCertificate(Request $request, $id){
        $user = $request->user()->userInfos;
        $certificate = certificate_userinfo::where('id', $id)
                        ->where('user_id', $user->id)
                        ->where('external_certificate', true)
                        ->first();

        if(!$certificate){
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        // Optionally, delete the file from storage
        $certificate->delete();

        return response()->json(['message' => 'Certificate deleted successfully']);
    }

    public function getExternalCertificate(Request $request, $id){
        $user = $request->user()->userInfos;
        $certificate = certificate_userinfo::where('id', $id)
                        ->where('user_id', $user->id)
                        ->where('external_certificate', true)
                        ->first();

        if(!$certificate){
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        return response()->json(['data' => $certificate]);
    }
}

