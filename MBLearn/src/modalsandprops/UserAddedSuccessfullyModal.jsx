import { faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { use } from "react"

const UserAddedSuccessfullyModal = ({success, close, userdata}) => {
    return(
        <Dialog open={success} onClose={close}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-20"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full w-fit p-5 flex flex-row'>
                            {/* check icon */}
                            <div className="p-5">
                                <div className="bg-primarybg p-11 rounded-full">
                                    <div className="h-full w-fit aspect-square flex items-center justify-center">
                                        <FontAwesomeIcon icon={faUserPlus} className="text-primary text-4xl"/>
                                    </div>
                                </div>
                            </div>
                            {/* confirmation */}
                            <div className="p-5">
                                <h1 className="font-header text-2xl text-primary py-1">Employee Added</h1>
                                <p className="font-text text-sm text-unactive py-1">The user has been successfully added to the system records,with their details and assigned roles securely stored.</p>
                                <div className="grid grid-cols-3 pb-5 ">
                                    {/* Employee Info Header */}
                                    <div className="col-span-3 py-4 border-b border-divider">
                                        <p className="uppercase font-header text-sm">Employee Information</p>
                                    </div>

                                    {/* Name */}
                                    <div className="row-start-2 col-span-2 py-4 border-divider border-b border-r">
                                        <p className="font-header text-xs">Name</p>
                                        <p className="font-text text-xs">{userdata.name}</p>
                                    </div>

                                    {/* EmployeeID */}
                                    <div className="row-start-2 col-span-1 py-4 pl-4 border-divider border-b">
                                        <p className="font-header text-xs">Employee ID</p>
                                        <p className="font-text text-xs">{userdata.employeeID}</p>
                                    </div>

                                    {/* System Role */}
                                    <div className="row-start-3 col-span-1 py-4 border-divider border-b border-r">
                                        <p className="font-header text-xs">System Role</p>
                                        <p className="font-text text-xs">{userdata.role}</p>
                                    </div>

                                    {/* Department */}
                                    <div className="row-start-3 col-start-2 py-4 pl-4 pr-4 border-divider border-b border-r">
                                        <p className="font-header text-xs">Department</p>
                                        <p className="font-text text-xs">{userdata.department}</p>
                                    </div>


                                    {/* Job Title*/}
                                    <div className="row-start-3 col-start-3 py-4 pl-4 border-divider border-b">
                                        <p className="font-header text-xs">Title</p>
                                        <p className="font-text text-xs">{userdata.title}</p>
                                    </div>

                                    {/* Branch*/}
                                    <div className="row-start-4 col-span-2 py-4 border-r border-b border-divider">
                                        <p className="font-header text-xs">Branch</p>
                                        <p className="font-text text-xs">{userdata.branch}</p>
                                    </div>

                                    {/* City */}
                                    <div className="row-start-4 col-start-3 py-4 pl-4 border-b border-divider">
                                        <p className="font-header text-xs">City</p>
                                        <p className="font-text text-xs">{userdata.city}</p>
                                    </div>

                                    {/* userinfo inputted */}
                                    {/* Employee Credentials */}
                                    <div className=" row-start-5 col-span-3 py-4 border-divider border-b">
                                        <p className="uppercase font-header text-sm">Employee Account Credentials</p>
                                    </div>


                                    {/* MBEmail */}
                                    <div className="row-start-6 col-span-2 py-4 border-r border-divider">
                                        <p className="font-header text-xs">Metrobank Working Email</p>
                                        <p className="font-text text-xs">{userdata.MBemail}</p>
                                    </div>

                                    {/* Name */}
                                    <div className="row-start-6 col-span-2 py-4 pl-4 ">
                                        <p className="font-header text-xs">Password</p>
                                        <p className="font-text text-xs">{userdata.password}</p>
                                    </div>
                                </div>

                                {/* Button confirmation */}
                                <div className="">
                                        <button className="font-header text-white rounded-md bg-primary p-3 w-full hover:scale-105 hover:bg-primaryhover transition-all ease-in-out" onClick={close}>Confirm</button>
                                </div>

                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default UserAddedSuccessfullyModal
