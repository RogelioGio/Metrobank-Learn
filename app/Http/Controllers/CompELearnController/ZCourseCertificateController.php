<?php

namespace App\Http\Controllers\CompELearnController;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\ZCompELearnCertificateCreditor;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\ZCompELearnCertificate;
use App\Models\ZCompELearnUserReports;
use App\Models\ZCompELearnCourseVersionHistory;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log; 

class ZCourseCertificateController extends Controller
{
    public function uploadCertificateCreditors(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'CreditorName' => 'required|string|max:255',
            'CreditorPosition' => 'nullable|string|max:255',
            'SignatureURL_Path' => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:2048',
        ]);

        if ($request->hasFile('SignatureURL_Path')) {
            $file = $request->file('SignatureURL_Path');

            $path = $file->store('CreditorSignature', 'public');

            $creditor = new ZCompELearnCertificateCreditor();
            $creditor->certificate_id = $certificateId;
            $creditor->CreditorName = $validated['CreditorName'];
            $creditor->CreditorPosition = $validated['CreditorPosition'] ?? null;
            $creditor->SignatureURL_Path = Storage::disk('public')->url($path);
            $creditor->save();

            $user = auth()->user();
            $userInfoId = $user->userInfos->id;

            $changes = [
                'Creditor' => [
                    'old' => null,
                    'new' => $creditor->SignatureURL_Path,
                ],
            ];

            ZCompELearnCourseVersionHistory::create([
                'CourseID' => $certificateId,
                'UserInfoID' => $userInfoId,
                'Action' => 'Added Certificate Creditor',
                'Changes' => $changes,
            ]);

            return response()->json([
                'message' => 'Certificate creditor saved successfully',
                'data' => $creditor,
                'file_url' => $creditor->SignatureURL_Path,
            ]);
        }

        return response()->json([
            'message' => 'No file uploaded',
        ], 400);
    }


    public function updateCertificateCreditors(Request $request, $creditorId)
    {
        $user = auth()->user();
        $userInfoId = $user->userInfos->id;

        // Log::info('Update Certificate Creditor request data:', $request->all());
        // Log::info('Update Certificate Creditor uploaded files:', $request->file());

        $creditor = ZCompELearnCertificateCreditor::find($creditorId);

        if (!$creditor) {
            return response()->json(['message' => 'Creditor not found'], 404);
        }

        $validated = $request->validate([
            'CreditorName' => 'required|string|max:255',
            'CreditorPosition' => 'nullable|string|max:255',
            'SignatureURL_Path' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf|max:2048',
        ]);

        $oldSignature = $creditor->SignatureURL_Path;

        $creditor->CreditorName = $validated['CreditorName'];
        $creditor->CreditorPosition = $validated['CreditorPosition'] ?? null;

        if ($request->hasFile('SignatureURL_Path')) {
            $file = $request->file('SignatureURL_Path');

            if ($oldSignature) {
                $oldPath = str_replace(env('APP_URL') . '/storage/', '', $oldSignature);

                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $file->store('CreditorSignature', 'public');
            $creditor->SignatureURL_Path = Storage::disk('public')->url($path);
        }

        $creditor->save();

        $logDetails = [
            'CreditorID' => $creditor->id,
            'CreditorName' => $creditor->CreditorName,
            'CreditorPosition' => $creditor->CreditorPosition,
        ];

        if ($request->hasFile('SignatureURL_Path')) {
            $logDetails['OldSignatureURL'] = $oldSignature;
            $logDetails['NewSignatureURL'] = $creditor->SignatureURL_Path;
        }

        ZCompELearnCourseVersionHistory::create([
            'CourseID' => $creditor->certificate_id,
            'UserInfoID' => $userInfoId,
            'Action' => 'Updated Certificate Creditor',
            'Changes' => [
                'Creditor' => [
                    'old' => $oldSignature ?? null,
                    'new' => $creditor->SignatureURL_Path,
                ],
            ],
        ]);


        return response()->json([
            'message' => 'Certificate creditor updated successfully',
            'data' => $creditor,
            'file_url' => $creditor->SignatureURL_Path,
        ]);
    }





    public function certificateCreditorCredentials($certificateId)
    {
        if (!is_numeric($certificateId)) {
            return response()->json(['message' => 'Invalid certificate ID'], 400);
        }
        
        $certificate = ZCompELearnCertificate::find($certificateId);    
        $course = ZCompELearnCreatedCourse::find($certificate->course_id);
        $courseName = $course->CourseName;

        $creditors = ZCompELearnCertificateCreditor::where('certificate_id', $certificateId)
            ->latest()
            ->take(3)
            ->get();

        $pdf = Pdf::loadView('certificate.template2', [
            'creditors' => $creditors,
            'certificateId' => $certificateId,
            'CourseName' => $courseName,
        ])->setPaper('letter', 'landscape');

        // \Log::info($creditors);

        return $pdf->stream("certificate_{$certificateId}.pdf");
    }


  public function fetchCertificateSignatures($certificateId)
  {
    $creditors = ZCompELearnCertificateCreditor::where('certificate_id', $certificateId)
        ->latest()
        ->take(3)
        ->get();

    return response()->json($creditors);
  }

    public function deleteCertificateSignature($creditorId)
    {
        $creditor = ZCompELearnCertificateCreditor::find($creditorId);

        if (!$creditor) {
            return response()->json(['message' => 'Signature not found'], 404);
        }

        if ($creditor->SignatureURL_Path) {
            $relativePath = str_replace(env('APP_URL') . '/storage/', '', $creditor->SignatureURL_Path);

            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $creditor->delete();

        return response()->json(['message' => 'Signature deleted successfully']);
    }

}
