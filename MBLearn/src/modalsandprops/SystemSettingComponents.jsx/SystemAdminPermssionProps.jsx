import { Switch } from "MBLearn/src/components/ui/switch"
import CourseAdminPermissionProps from "./CourseAdminPermissionProps"
import { useEffect, useState } from "react"
import LearnerPermissionProps from "./LearnerPermissionProps";

const SystemAdminPermissionProps = ({isChecked,permissionswitch,permissionRef}) => {

    const [roleHopping, setRoleHopping] = useState();
    useEffect(()=> {
        isChecked("RoleHopping") ? setRoleHopping(true) : null
    },[permissionswitch])

    return(
        <>
        {/* User Management Permssion */}
        <div>
            <p className="font-text text-unactive text-sm py-2">User Managment Permissions</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="addUser">
                        <h1 className="font-header text-primary text-base">Add User</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to add another user in the system</p>
                    </label>
                    <Switch id="addUser" checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)}}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="editUser">
                        <h1 className="font-header text-primary text-base">Edit User</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to edit another user's information in the system</p>
                    </label>
                    <Switch id="editUser" checked={isChecked("EditUserInfo")} onCheckedChange={(checked) => permissionswitch(permissionRef?.find(p => p.permission_name === "EditUserInfo").id,"EditUserInfo",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="deleteUser">
                        <h1 className="font-header text-primary text-base">Delete User</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to remove or archived another user in the system</p>
                    </label>
                    <Switch id="deleteUser" checked={isChecked("DeleteUserInfo")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "DeleteUserInfo").id,"DeleteUserInfo",checked)}/>
                </div>
            </div>
        </div>
        {/* System Access Permissions */}
        <div>
            <p className="font-text text-unactive text-sm py-2">System Access Permissions</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="editUserCreds">
                        <h1 className="font-header text-primary text-base">Edit User Login Credentials</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to edit another user's login credentials in the system</p>
                    </label>
                    <Switch id="editUserCreds" checked={isChecked("EditUserCredentials")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "EditUserCredentials").id,"EditUserCredentials",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="editUserRole">
                        <h1 className="font-header text-primary text-base">Edit User Role</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to edit another user's role in the system</p>
                    </label>
                    <Switch id="editUserRole" checked={isChecked("EditUserRoles")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "EditUserRoles").id,"EditUserRoles",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="editUserRole">
                        <h1 className="font-header text-primary text-base">Edit User Permission</h1>
                        <p className="font-text text-unactive text-sm">Grants the ability to modify a user's access rights and assigned roles within the system.</p>
                    </label>
                    {/* <Switch id="editUserRole" checked={isChecked("EditUserRoles")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "EditUserRoles").id,"EditUserRoles",checked)}/> */}
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="accountReactivation">
                        <h1 className="font-header text-primary text-base">Account Reactivation</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to have the ability to reactivate user in the system</p>
                    </label>
                    <Switch id="accountReactivation" checked={isChecked("AccountReactivation")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "AccountReactivation").id,"AccountReactivation",checked)}/>
                </div>
            </div>
        </div>
        {/* Form Input */}
        <div>
            <p className="font-text text-unactive text-sm py-2">System Configuration Permissions</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="addFormInputs">
                        <h1 className="font-header text-primary text-base">Add Form Inputs</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to add form input in the system</p>
                    </label>
                    <Switch id="addFormInputs" checked={isChecked("AddFormInput")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "AddFormInput").id,"AddFormInput",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="editFormInputs">
                        <h1 className="font-header text-primary text-base">Edit Form Inputs</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to edit form input in the system</p>
                    </label>
                    <Switch id="editFormInputs" checked={isChecked("EditFormInput")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "EditFormInput").id,"EditFormInput",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="deleteFormInputs">
                        <h1 className="font-header text-primary text-base">Delete Form Inputs</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to remove or archived form input in the system</p>
                    </label>
                    <Switch id="deleteFormInputs" checked={isChecked("DeleteFormInput")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "DeleteFormInput").id,"DeleteFormInput",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="deleteFormInputs">
                        <h1 className="font-header text-primary text-base">Edit Default Permissions</h1>
                        <p className="font-text text-unactive text-sm">Allows administrators to configure and update the default access settings assigned to new users based on their roles.</p>
                    </label>
                    {/* <Switch id="deleteFormInputs" checked={isChecked("DeleteFormInput")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "DeleteFormInput").id,"DeleteFormInput",checked)}/> */}
                </div>
            </div>
        </div>
        {/* Report Management Permissions */}
        <div>
            <p className="font-text text-unactive text-sm py-2">Report Management Permissions</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="readReports">
                        <h1 className="font-header text-primary text-base">Read Reports</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to read reports in the system</p>
                    </label>
                    <Switch id="readReports" checked={isChecked("ReadReports")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "ReadReports").id,"ReadReports",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="exportReport">
                        <h1 className="font-header text-primary text-base">Export Report</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to export reports from the system</p>
                    </label>
                    <Switch id="exportReport" checked={isChecked("ExportReports")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "ExportReports").id,"ExportReports",checked)}/>
                </div>
            </div>
        </div>
        {/* Cascading Account Role Permission */}
        <div>
            <p className="font-text text-unactive text-sm py-2">Role Access Permission</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="exportReport">
                        <h1 className="font-header text-primary text-base">Role Hopping</h1>
                        <p className="font-text text-unactive text-sm">The user have the permission to login as different role <br /> whereas they can be a course admin or learner in the same account</p>
                    </label>
                    <Switch id="exportReport" checked={isChecked("RoleHopping")} onCheckedChange={(checked) => {permissionswitch(permissionRef.find(p => p.permission_name === "RoleHopping").id,"RoleHopping",checked),setRoleHopping(checked)}}/>
                </div>
            </div>
        </div>
        {
            roleHopping && (
                <>
                    <CourseAdminPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={permissionRef} systemAdminRoleHopState={roleHopping}/>
                    <LearnerPermissionProps isChecked={isChecked} permissionswitch={permissionswitch} permissionRef={permissionRef} />
                </>
            )
        }

        </>
    )
}

export default SystemAdminPermissionProps
