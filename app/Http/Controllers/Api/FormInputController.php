<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArchiveRestoreDeleteMultipleFormInputsRequest;
use App\Models\Branch;
use App\Models\CareerLevel;
use App\Models\CarouselImage;
use App\Models\Category;
use App\Models\certificate_userinfo;
use App\Models\City;
use App\Models\Department;
use App\Models\Division;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Title;
use App\Services\UserLogService;
use Illuminate\Http\Request;

class FormInputController extends Controller
{
    public function BulkActions(ArchiveRestoreDeleteMultipleFormInputsRequest $request, UserLogService $log){
        $validated = $request->validated();
        $type = $validated['type'];
        $action = $validated['action'];

        $name = "";
        $secondName = "";
        $thirdName = "";
        $secondQuery = null;
        $thirdQuery = null;
        switch($type){
            case "branch":
                $query = Branch::query();
                $name = "branch_name";
                break;
            case "careerlevel":
                $query = CareerLevel::query();
                $name = "name";
                break;
            case "carouselimage":
                $query = CarouselImage::query();
                $name = "image_name";
                break;
            case "category":
                $query = Category::query();
                $name = "category_name";
                break;
            case "externalcertificate":
                $query = certificate_userinfo::query();
                $name = "external_certificate_name";
                break;
            case "city":
                $query = City::query();
                if($action === "delete"){
                    $secondQuery = Branch::whereHas('city', fn($q) => $q->onlyTrashed()->whereIn('id', array_column($validated['data'], 'id')));
                } else {
                    $secondQuery = Branch::whereHas('city', fn($q) => $q->whereIn('id', array_column($validated['data'], 'id')));
                }
                $secondName = "branch_name";
                $name = "city_name";
                break;
            case "department":
                $query = Department::query();
                if($action === "delete"){
                    $secondQuery = Title::whereHas('department', fn($q) => $q->onlyTrashed()->whereIn('id', array_column($validated['data'], 'id')));
                } else{
                    $secondQuery = Title::whereHas('department', fn($q) => $q->whereIn('id', array_column($validated['data'], 'id')));
                }
                $secondName = 'title_name';
                $name = "department_name";
                break;
            case "division":
                $query = Division::query();
                if($action === "delete"){
                    $secondQuery = Department::whereHas('division', fn($q) => $q->onlyTrashed()->whereIn('id', array_column($validated['data'], 'id')));
                    $thirdQuery = Title::whereHas('division', fn($q) => $q->onlyTrashed()->whereIn('division_id', array_column($validated['data'], 'id')));
                } else{
                    $secondQuery = Department::whereHas('division', fn($q) => $q->whereIn('id', array_column($validated['data'], 'id')));
                    $thirdQuery = Title::whereHas('division', fn($q) => $q->whereIn('division_id', array_column($validated['data'], 'id')));
                }

                $secondName = 'department_name';
                $thirdName = 'title_name';
                $name = "division_name";
                break;
            case 'permission':
                $query = Permission::query();
                $name = "permission_name";
                break;
            case 'role':
                $query = Role::query();
                $name = "role_name";
                break;
            case 'title':
                $query = Title::query();
                $name = "title_name";
                break;
        }

        switch($action){
            case "archive":
                if($thirdQuery){ // These are first because delete wont see if you delete where they belongs
                    $thirdNamesArray = $thirdQuery->pluck($thirdName)->toArray();
                    $thirdQuery->delete();
                }
                if($secondQuery){
                    $secondNamesArray = $secondQuery->pluck($secondName)->toArray();
                    $secondQuery->delete();
                }
                $namesArray = $query->whereIn('id', array_column($validated['data'], 'id'))->pluck($name)->toArray();
                $query->delete();
                break;
            case "restore":
                $ids = array_column($validated['data'], 'id');
                $restoredNames = [];
                $notRestoredNames = [];

                switch($type){
                    case "division":
                        $divisions = Division::onlyTrashed()->whereIn('id', $ids)->get();
                        foreach ($divisions as $div) {
                            $div->restore();
                            $restoredNames[] = $div->division_name;
                        }
                        break;

                    case "department":
                        $departments = Department::onlyTrashed()->whereIn('id', $ids)->get();
                        foreach($departments as $dept){
                            if($dept->division && !$dept->division->trashed()){
                                $dept->restore();
                                $restoredNames[] = $dept->department_name;
                            } else {
                                $notRestoredNames[] = $dept->department_name;
                            }
                        }
                        break;

                    case "title":
                        $titles = Title::onlyTrashed()->whereIn('id', $ids)->get();
                        foreach($titles as $t){
                            $dept = $t->department;
                            $div = $dept ? $dept->division : null;

                            if($dept && !$dept->trashed() && $div && !$div->trashed()){
                                $t->restore();
                                $restoredNames[] = $t->title_name;
                            } else {
                                $notRestoredNames[] = $t->title_name;
                            }
                        }
                        break;
                    case "branch":
                    $branches = Branch::onlyTrashed()->whereIn('id', $ids)->get();
                    foreach ($branches as $branch) {
                        $city = $branch->city;

                        if ($city && !$city->trashed()) {
                            $branch->restore();
                            $restoredNames[] = $branch->branch_name;
                        } else {
                            $notRestoredNames[] = $branch->branch_name;
                        }
                    }
                    break;

                    default:
                        // $restoredNames = $query->whereIn('id', $ids)->pluck($name)->toArray();
                        // $query->onlyTrashed()->whereIn('id', $ids)->restore();

                    $items = $query->onlyTrashed()->whereIn('id', $ids);
                    $restoredNames = $items->pluck($name)->toArray(); // get names before restoring
                    $items->restore();

                        break;
                }

                // Logging and response handling
                $namesArray = $restoredNames;
                $message = "Restored: [" . implode(', ', $restoredNames) . "]";
                if (count($notRestoredNames) > 0) {
                    $message .= " | Not restored (parent still archived): [" . implode(', ', $notRestoredNames) . "]";
                }

                // Create a structured response for both success and failure
                // return response()->json([
                //     'message' => $message,
                //     'restored_count' => count($restoredNames),
                //     'not_restored_count' => count($notRestoredNames),
                //     'restored' => $restoredNames,
                //     'not_restored' => $notRestoredNames
                // ]);
                break;
            case "delete":
                if($thirdQuery){
                    $thirdNamesArray = $thirdQuery->pluck($thirdName)->toArray();
                    $thirdQuery->forceDelete();
                }
                if($secondQuery){
                    $secondNamesArray = $secondQuery->pluck($secondName)->toArray();
                    $secondQuery->forceDelete();
                }
                $namesArray = $query->onlyTrashed()->whereIn('id', array_column($validated['data'], 'id'))->pluck($name)->toArray();
                $query->forceDelete();
                break;
        }

        $names = implode(', ', $namesArray);
        $currUser = $request->user()->userInfos;
        if($thirdQuery && ($action === "archive" || $action === "delete")){
            $thirdNames = implode(', ', $thirdNamesArray);
            $secondNames = implode(', ', $secondNamesArray);
            $log->log(
                $currUser->id,
                "$action inputs",
                $currUser->fullName()." has ".$action."d $type/s named [$names], $secondName [$secondNames], and $thirdName [$thirdNames]",
                $request->ip(),
            );
        } else if ($secondQuery && ($action === "archive" || $action === "delete")){
            $secondNames = implode(', ', $secondNamesArray);
            $log->log(
                $currUser->id,
                "$action inputs",
                $currUser->fullName()." has ".$action."d $type/s named [$names], and $secondName [$secondNames],",
                $request->ip(),
            );
        } else {
            $log->log(
                $currUser->id,
                "$action inputs",
                $currUser->fullName()." has ".$action."d $type/s named [$names]",
                $request->ip(),
            );
        }
        return response()->json([
            'message' => "[$names] has been ".$action."d.",
        ]);
    }

    public function SoftDelete($id) {
        $branch = Branch::findOrFail($id);
        $branch->delete();

        return response()->json([
            'message' => "Branch has been soft deleted.",
        ]);
    }

    public function Restore($id) {
        $branch = Branch::onlyTrashed()->findOrFail($id);
        $branch->restore();

        return response()->json([
            'message' => "Branch has been restored.",
        ]);
    }

    public function getDeleted() {
        // $divisions = Division::with('departments.titles.user', 'departments.titles.careerLevel')->onlyTrashed()->get();
        // $divisions->each(function ($division) {
        //     $division->departments->each(function ($department) use ($division) {
        //         $department->titles->each(function ($title) use ($division) {
        //             $title->division_id = $division->id;
        //         });
        //     });
        // });
        $options = [
            'AllCities' => City::withTrashed()->get(),
            'AllDivisions' => Division::with('departments.titles.user', 'departments.titles.careerLevel')->withTrashed()->get(),
            'AllDepartments' => Department::withTrashed()->get(),
            'AllLocation' => Branch::withTrashed()->get(),
            'Deleted_cities' => City::onlyTrashed()->get(),
            'Deleted_divisions' => Division::onlyTrashed()->get(),
            'Deleted_department' => Department::onlyTrashed()->get(),
            'Deleted_titles' => Title::onlyTrashed()->get(),
            'Deleted_location' => Branch::onlyTrashed()->get(),
        ];

        return response()->json($options);

    }

    public function getCourseFormInputDeleted() {
        $options = [
            'Deleted_categories' => Category::onlyTrashed()->get(),
        ];

        return response()->json($options);

    }
}
