<?php

namespace App\Listeners;

use App\Events\PublishCourse;
use App\Models\Course;
use App\Models\ZCompELearnCreatedCourse;
use App\Models\UserInfos;
use App\Jobs\NotifyAllCourseAdmins;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class MirrorPublishedCourse implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {

    }

    /**
     * Handle the event.
     */
    public function handle(PublishCourse $event): void
    {
        $course = $event->course;

        $publishedCourses = ZCompELearnCreatedCourse::where('CourseStatus', "published")->find($course->id);

        $assignerName = $event->assignerName;
        
        $course = Course::create([
            'courseName' => $publishedCourses->CourseName,
            'courseID' => $publishedCourses->CourseID,
            'overview' => $publishedCourses->Overview,
            'objective' => $publishedCourses->Objective,
            'training_type' => $publishedCourses->TrainingType,
            'career_level_id' => $publishedCourses->career_level_id,
            'status' => 'active',
            'category_id' => $publishedCourses->category_id,
            'user_info_id' => $publishedCourses->user_info_id,
            'image_path' => "$publishedCourses->ImagePath",
            'courseDuration' => $publishedCourses->CourseDuration,
        ]);

        Log::info("GUMANA KA PLZ lang hehe", []);

        $emptyJson = json_encode([]);
        Log::info('Empty JSON for Course Summary:', ['json' => $emptyJson]);

        $course->lessons()->create([
            'lesson_name' => "Course Summary",
            'lesson_content_as_json' => '{}',
            'currentOrderPosition' => null,
        ]);

        $lessonsToCopy = $publishedCourses->lessons()->where('Trashed', 0)->get();
        foreach ($lessonsToCopy as $lesson) {
            if (is_null($lesson->LessonContentAsJSON)) {
                Log::warning("Skipping lesson with null content: {$lesson->LessonName}");
                continue;
            }

            // Log::info("Copying lesson: {$lesson->LessonName}", [
            //     'lesson_content_as_json' => $lesson->LessonContentAsJSON,
            //     'currentOrderPosition' => $lesson->currentOrderPosition,
            // ]);

            $course->lessons()->create([
                'lesson_name' => $lesson->LessonName,
                'lesson_content_as_json' => $lesson->LessonContentAsJSON ?? '{}',
                'currentOrderPosition' => $lesson->currentOrderPosition,
                'lessonDuration' => $lesson->LessonDuration,
            ]);
        }

        $attachmentsToCopy = $publishedCourses->attachments()->where('Trashed', 0)->get();
        foreach ($attachmentsToCopy as $attachment) {
            $course->attachments()->create([
                'FileName' => $attachment->FileName,
                'FilePath' => $attachment->FilePath,
                'VideoName' => $attachment->VideoName,
                'VideoPath' => $attachment->VideoPath,
                'currentOrderPosition' => $attachment->currentOrderPosition,
                'AttachmentDescription' => $attachment->AttachmentDescription,
                'AttachmentType' => $attachment->AttachmentType,
                'attachmentDuration' => $attachment->AttachmentDuration,
            ]);
        }

        $testsToCopy = $publishedCourses->tests()->where('Trashed', 0)->get();
        foreach ($testsToCopy as $test) {
            $assessment = $course->tests()->create([
                'TestName' => $test->TestName,
                'TestDescription' => $test->TestDescription,
                'TestType' => $test->TestType,
                'currentOrderPosition' => $test->currentOrderPosition,
                'assessmentDuration' => $test->AssessmentDuration,
                'passing_rate' => 50,
                'max_attempt' => 1,
            ]);

            foreach ($test->customBlocks as $block) {
                $assessment->questions()->create([
                    'QuestionType' => $block->QuestionType,
                    'BlockData' => json_encode($block->BlockData),
                ]);
            }
        }

        foreach($publishedCourses->certificates as $certificate){
            $cert = $course->certificate()->create([
                'CertificateName' => $certificate->CertificateName
            ]);
            foreach($certificate->creditors as $creditor){
                $cert->creditors()->create([
                    'creditor_name' => $creditor->CreditorName,
                    'creditor_position' => $creditor->CreditorPosition,
                    'creditor_signature_img_url' => $creditor->SignatureURL_Path,
                ]);
            }
        }

        
        $adminIds = UserInfos::whereHas('roles', function($q){
            $q->whereIn('role_name', ['Course Admin', 'System Admin']);
        })->pluck('id');

        $syncData = $adminIds->mapWithKeys(function ($id) use ($assignerName) {
            return [$id => ['distributor_id' => $assignerName->id]];
        })->toArray();

        $course->assignedCourseAdmins()->sync($syncData);

        NotifyAllCourseAdmins::dispatch($course, $assignerName->fullName());

    }
}
