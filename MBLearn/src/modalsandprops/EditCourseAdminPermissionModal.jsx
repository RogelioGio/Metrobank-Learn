import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Switch } from "MBLearn/src/components/ui/switch"


const EditCourseAdminPermissionModal = ({open, onClose, courseAdmin}) => {
    return(
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md w-[50vw] bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header text-3xl">Edit Course Admins Permission</h1>
                                    <p className="text-unactive font-text text-xs">Manage all current assigned course addmin permissions of the selected user</p>
                                </div>
                                {/* Close Button */}
                                <div className="w-fit flex flex-row justify-end items-start">
                                    <div className="group w-8 h-8 rounded-full bg-white shadow-md border-2 border-primary flex flex-row justify-center items-center hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer"onClick={()=>onClose()}>
                                        <FontAwesomeIcon icon={faXmark} className="group-hover:text-white text-primary cursor-pointer"/>

                                    </div>
                                </div>
                            </div>
                            {/* Selected User */}
                            <div className="px-4 py-2 flex flex-col justify-between gap-y-2">
                                <p className="text-xs text-unactive font-text">Selected Course Admins:</p>
                                <div className="flex flex-row gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primaryhover">
                                        <img src={courseAdmin?.profile_image} alt="" className="rounded-full"/>
                                    </div>
                                    <div>
                                        <p className="text-primary font-header text-xl">{courseAdmin?.first_name} {courseAdmin?.middle_name} {courseAdmin?.last_name} {courseAdmin?.name_suffix}</p>
                                        <p className="text-unactive font-text text-xs">ID: {courseAdmin?.employeeID}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Permissions */}
                            <div className="px-4 py-2">
                                <p className="font-text text-unactive text-xs py-2">Permissions:</p>
                                <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="">
                                            <h1 className="font-header text-primary text-base">Enroll Learner</h1>
                                            <p className="font-text text-unactive text-sm">Allows the Assigned Course Admin to manually add learners to the course.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="" className="pr-4">
                                            <h1 className="font-header text-primary text-base">Edit Assigned Course Admin</h1>
                                            <p className="font-text text-unactive text-sm">Enables them to update the details or roles of other assigned course admins within the same course.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="">
                                            <h1 className="font-header text-primary text-base">Remove Assigned Course Admin</h1>
                                            <p className="font-text text-unactive text-sm"> Grants the ability to revoke access or remove another course admin from the course.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="">
                                            <h1 className="font-header text-primary text-base">Control Course Status</h1>
                                            <p className="font-text text-unactive text-sm"> Allows publish, unpublish, and archiving of the course based on progress, deadlines, or availability.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="">
                                            <h1 className="font-header text-primary text-base">Edit Course Details</h1>
                                            <p className="font-text text-unactive text-sm"> Enables updating of course information such as title, description, duration.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                    <div className="w-full flex flex-row justify-between items-center">
                                        <label htmlFor="">
                                            <h1 className="font-header text-primary text-base">Assign New Course Admin</h1>
                                            <p className="font-text text-unactive text-sm">Gives permission to designate additional course admins to help manage the course.</p>
                                        </label>
                                        <Switch id=""
                                        // checked={isChecked("AddUserInfo")} onCheckedChange={(checked) => {permissionswitch(permissionRef?.find(p => p.permission_name === "AddUserInfo").id,"AddUserInfo",checked)
                                        //     console.log(permissionRef)
                                        // }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Action Button */}
                            <div className="row-start-5 col-span-3 py-2 px-4 flex flex-row gap-2">
                                <button type="button" className="w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                    onClick={() => {
                                        onClose();
                                    }}
                                    >
                                    <p>Cancel</p>
                                </button>
                                <button type="submit" className="w-full inline-flex flex-col items-center gap-2 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out">
                                    <p>Edit</p>
                                </button>
                            </div>

                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
export default EditCourseAdminPermissionModal;
