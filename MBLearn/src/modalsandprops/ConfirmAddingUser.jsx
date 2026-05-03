import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"
import { useOption } from "../contexts/AddUserOptionProvider"


const ConfirmAddingUser = ({open, close, user, permissions,handleAdding}) => {
    const {cities,departments,location,titles,roles,permission,career_level,divisions} = useOption();

    return (
        <Dialog open={open} onClose={()=>{}}>
                    <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[50vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col w-full'>
                                    {/* Header */}
                                    <div className="py-4 mx-4 flex flex-row justify-between item-center w-full">
                                        <div className="flex flex-col w-full">
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Confirm Adding User</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Review the information in the field before adding the user</p>
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col gap-2 auto px-4 mb-4">
                                        <div className="flex flex-row gap-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Employee Fullname</p>
                                                <p className="font-header">{user.firstname} {user.middlename === '' ? '' : user.middlename} {user.lastname}</p>
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Employee ID</p>
                                                <p className="font-header">ID: {user.employeeID}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Division</p>
                                                <p className="font-header">{divisions.find(d=> d.id === Number(user.division))?.division_name || "Not Selected"}</p>
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Department</p>
                                                <p className="font-header">{divisions.find(d=> d.id === Number(user.division))?.departments.find(d=>d.id === Number(user.department))?.department_name || "Not Selected"}</p>
                                            </div>
                                            <div className="flex flex-col w-full ">
                                                <p className="font-text text-xs text-unactive">Career Level</p>
                                                <p className="font-header">{(career_level.find(c => c.id === Number(user.career_level))?.name + " Level") || "Not Selected"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-text text-xs text-unactive">Title</p>
                                            <p className="font-header">{divisions.find(d=> d.id === Number(user.division))?.departments.find(d=>d.id === Number(user.department))?.titles.find(t=> t.id === Number(user.title))?.title_name || "Not Selected"}</p>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">City</p>
                                                <p className="font-header">{cities.find(c=> c.id === Number(user.city))?.city_name || "Not Selected"}</p>
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Branch</p>
                                                <p className="font-header">{location.find(c=> c.id === Number(user.branch))?.branch_name || "Not Selected"}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Email</p>
                                                <p className="font-header">{user.MBemail}</p>
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Initial Password</p>
                                                <p className="font-header">{user.firstname?.replace(/\s+/g, '').trim()}_{user.employeeID}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Account Role</p>
                                                <p className="font-header">{user.role === "0" ? "Not Selected" : roles.find(r=>r.id === Number(user.role))?.role_name}</p>
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="font-text text-xs text-unactive">Permissions</p>
                                                <p className="font-header">{permissions?.length} Selected Permissions</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-row items-center justify-between gap-1 px-4">
                                        <div className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header"
                                        onClick={()=>{close()}}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                            onClick={()=>{handleAdding()}}>
                                            <p>Confirm</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
        </Dialog>
    )
}

export default ConfirmAddingUser
