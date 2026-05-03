import { Switch } from "MBLearn/src/components/ui/switch"
import { useEffect, useState } from "react";
import LearnerPermissionProps from "./LearnerPermissionProps";

const CourseAdminPermissionProps = ({isChecked,permissionswitch,permissionRef,systemAdminRoleHopState}) => {

    const [roleHopping, setRoleHopping] = useState();
    useEffect(() => {
        isChecked("RoleHopping") ? setRoleHopping(true) : setRoleHopping(false)
    },[permissionswitch])

    return(
        <>
            {/* Course Management Permission */}
        <div>
            <p className="font-text text-unactive text-sm py-2">Course Management Permission</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="AddCourse">
                        <h1 className="font-header text-primary text-base">Add Course</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to add courses in the system</p>
                    </label>
                    <Switch id="AddCourse" checked={isChecked("AddCourse")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "AddCourse").id,"AddCourse",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="EditCourseDetails">
                        <h1 className="font-header text-primary text-base">Edit Course Details</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to edit course in the system</p>
                    </label>
                    <Switch id="EditCourseDetails" checked={isChecked("EditCourseDetails")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "EditCourseDetails").id,"EditCourseDetails",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="DeleteCourse">
                        <h1 className="font-header text-primary text-base">Delete Course</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to remove or archived courses in the system</p>
                    </label>
                    <Switch id="DeleteCourse" checked={isChecked("DeleteCourse")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "DeleteCourse").id,"DeleteCourse",checked)}/>
                </div>
            </div>
        </div>
        {/* Cascading Account Role Permission */}
        {
            !systemAdminRoleHopState && (<div>
                <p className="font-text text-unactive text-sm py-2">Role Access Permission</p>
                <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                    <div className="w-full flex flex-row justify-between items-center">
                        <label htmlFor="RoleHopping">
                            <h1 className="font-header text-primary text-base">Role Hopping</h1>
                            <p className="font-text text-unactive text-sm">The user have the permission to login as different role <br /> whereas they can be a course admin or learner in the same account</p>
                        </label>
                        <Switch id="RoleHopping" checked={isChecked("RoleHopping")} onCheckedChange={(checked) => {permissionswitch(permissionRef.find(p => p.permission_name === "RoleHopping").id,"RoleHopping",checked),setRoleHopping(checked)}}/>
                    </div>
                </div>
            </div>)
        }

        {
            roleHopping && !systemAdminRoleHopState ? (
                <LearnerPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={permissionRef} systemAdminRoleHopState={systemAdminRoleHopState} />
            ) : (null)
        }
        </>
    )
}
export default CourseAdminPermissionProps
