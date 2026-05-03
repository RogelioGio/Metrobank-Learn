import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import axiosClient from "../axios-client"
import { act, useEffect, useState } from "react"
import { useOption } from "../contexts/AddUserOptionProvider"
import { useUser } from "../contexts/selecteduserContext"
import { toast } from "sonner"

const DeleteUserModal = ({open,close,classname, close_confirmation, selectedUser, active, permanent, handlePermDeleting, resetPermDeleting, fetchUser}) => {
    const {departments,titles,location,cities,division,section} = useOption()||{};
    //const {selectUser, selectedUser, isFetching} = useUser()
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // useEffect(() => {
    //     if (open && EmployeeID) {
    //         console.log("Modal opened with EmployeeID:", EmployeeID);
    //         if (selectedUser?.id === EmployeeID) {
    //             setLoading(false);
    //             console.log("Selected user already fetched:", selectedUser);
    //         } else {
    //             setLoading(true);
    //             console.log("Fetching user with EmployeeID:", EmployeeID);
    //             selectUser(EmployeeID);
    //         }
    //     }
    // }, [EmployeeID, selectedUser, open]);

    // useEffect(() => {
    //     if (selectedUser && !isFetching) {
    //         setLoading(false);
    //         console.log("Selected user fetched:", selectedUser);
    //     }
    // }, [selectedUser, isFetching]);

    // useEffect(() => {
    //     setLoading(isFetching);
    //     console.log("Fetching status changed:", isFetching);
    // }, [isFetching]);

    const DeleteUser = () => {
        setDeleting(true)
        if(!selectedUser) return;
        axiosClient.delete(`/delete-user/${selectedUser.id}`, )
        .then((res) => {
            setTimeout(()=>{setDeleting(false)},200)
            toast.success("User has been successfully Inactive.")
            fetchUser()
            close()
        }).catch((err) => {
            console.log(err)
            toast.error(err.response?.data?.message || "An error occurred while deleting the user.")
        })
        //setTimeout(() => {setDeleting(false); close_confirmation(); close();}, 2000)
    }

    const handlePermDeletion = () => {
        setDeleting(true);
        // setTimeout(() => {
        //
        // },5000)

        axiosClient.delete(`/hard-delete-user/${selectedUser.id}`)
        .then((res) => {
            setTimeout(()=>{setDeleting(false)},200)
            toast.success("User has been successfully deleted permanently.")
            setDeleting(false);
            fetchUser();
            close()
        }).catch((err) => {
            console.log(err)
            toast.error(err.response?.data?.message || "An error occurred while deleting the user.")
        })
    }

    useEffect(() => {
        console.log("handlePermDeleting changed:", handlePermDeleting);
        if (handlePermDeleting) {
            resetPermDeleting()
            handlePermDeletion();
        }
    },[handlePermDeleting])

    return(
        <Dialog open={open} onClose={()=>{}} className={classname}>
                    <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30" />
                        <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                            <div className='flex min-h-full items-center justify-center p-4 text center'>
                                <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[100vw]
                                                            lg:w-[70vw]'>
                                    <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                        <div className="py-4 mx-4 flex flex-row justify-between item-center gap-6 border-b border-divider">
                                            {
                                                active === "Active" ?
                                                <div>
                                                    <h1 className="text-primary font-header
                                                                    text-base
                                                                    md:text-2xl">Inactive User?</h1>
                                                    <p className="text-unactive font-text
                                                            text-xs
                                                            md:text-sm">Confirms the archival of the selected user.</p>
                                                </div> :
                                                <div>
                                                    <h1 className="text-primary font-header
                                                                    text-base
                                                                    md:text-2xl">Permenantly Delete User?</h1>
                                                    <p className="text-unactive font-text
                                                            text-xs
                                                            md:text-sm">Confirms permenantly deleting of the selected user.</p>
                                                </div>
                                            }
                                            <div className="">
                                                <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                                w-5 h-5 text-xs
                                                                md:w-8 md:h-8 md:text-base"
                                                    onClick={()=>{close()}}>
                                                    <FontAwesomeIcon icon={faXmark}/>
                                                </div>
                                            </div>
                                        </div>

                                        {
                                        loading ? (
                                            <div className="flex items-center justify-center p-32 text-unactive">
                                                Fetching data...
                                            </div>
                                        ):(
                                            <div className="px-5 py-1">
                                                <div className="grid grid-cols-[1fr_1fr_1fr]">

                                                    {/* Name */}
                                                    <div className="col-span-2 py-1
                                                                    sm:col-span-1 sm:py-2 sm:border-b border-divider">
                                                        <p className="font-text text-xs text-unactive">Employee's Full Name</p>
                                                        <p className="font-text text-base">{selectedUser?.first_name || "Not Available"} {selectedUser?.middle_name || ""} {selectedUser?.last_name || ""} {selectedUser?.suffix || ""}</p>
                                                    </div>

                                                    {/* EmployeeID */}
                                                    <div className="col-span-1 py-1
                                                                    sm:py-2 sm:border-b border-divider">
                                                        <p className="font-text text-xs text-unactive">Employee ID</p>
                                                        <p className="font-text text-base">{selectedUser?.employeeID || "No Employee ID"}</p>
                                                    </div>

                                                    {/* System Role */}
                                                    <div className="col-span-3 py-1
                                                                    sm:col-span-1 sm:py-2
                                                                    border-b border-divider">
                                                        <p className="font-text text-xs text-unactive">Account Role</p>
                                                        <p className="font-text text-base">{selectedUser?.roles?.[0]?.role_name || "No Role"}</p>
                                                    </div>

                                                    {/* Division */}
                                                    <div className=" col-span-3 pt-2 pb-1
                                                                    sm:col-span-1 sm:py-2">
                                                        <p className="font-text text-xs text-unactive">Division</p>
                                                        <p className="font-text text-base">{selectedUser?.title?.department?.division?.division_name || "No Division"}</p>
                                                    </div>

                                                    {/* Department */}
                                                    <div className=" col-span-3 py-1
                                                                    sm:col-span-1 sm:py-2">
                                                        <p className="font-text text-xs text-unactive">Department</p>
                                                        <p className="font-text text-base">{selectedUser?.title?.department?.department_name|| "No department"}</p>
                                                    </div>

                                                    {/* Career Level*/}
                                                    <div className=" col-span-3 py-1
                                                                    sm:col-span-1 sm:py-2">
                                                        <p className="font-text text-xs text-unactive">Title</p>
                                                        <p className="font-text text-base">{selectedUser?.title?.title_name || "No Section"}</p>
                                                        <p className="font-text text-xs">{selectedUser?.title?.career_level?.name|| "No Section"}</p>
                                                    </div>

                                                    {/* City */}
                                                    <div className=" col-start-1 py-1
                                                                    sm:py-0 sm:pb-2">
                                                        <p className="font-text text-xs text-unactive">City & Location</p>
                                                        <p className="font-text text-base">{selectedUser?.city?.city_name || "No city"}</p>
                                                        <p className="font-text text-xs">{selectedUser?.branch?.branch_name || "No Branch"}</p>
                                                    </div>
                                                </div>

                                                {/* <div className="row-start-7 col-span-3 py-2 flex flex-row gap-2">
                                                    <button className="w-full inline-flex flex-col items-center gap-2 row-start-7 col-span-3 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                                        onClick={close}>
                                                        <p>Cancel</p>
                                                    </button>
                                                    <button className="w-full inline-flex flex-col items-center gap-2 row-start-7 col-span-3 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                                        onClick={() => DeleteUser()}>
                                                        <p>{deleting ? "Deleting..." : "Remove User"}</p>
                                                    </button>
                                                </div> */}
                                            </div>
                                        )
                                        }
                                        {/* <div className="row-start-7 col-span-3 py-2 flex flex-row gap-2">
                                                    <button className="w-full inline-flex flex-col items-center gap-2 row-start-7 col-span-3 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                                        onClick={close}>
                                                        <p>Cancel</p>
                                                    </button>
                                                    <button className="w-full inline-flex flex-col items-center gap-2 row-start-7 col-span-3 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                                        onClick={() => DeleteUser()}>
                                                        <p>{deleting ? "Deleting..." : "Remove User"}</p>
                                                    </button>
                                                </div> */}
                                        <div className="flex flex-row justify-between gap-2 mx-4 pb-4">
                                            <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                                onClick={()=>{close()}}>
                                                <p className="font-header">
                                                    Cancel
                                                </p>
                                            </div>
                                            <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}
                                                onClick={() => {
                                                    if(active === "Active"){
                                                        if(deleting) return;
                                                        DeleteUser()
                                                        return;
                                                    }
                                                    if(deleting) return;
                                                    permanent()
                                                }}>
                                                <p className="font-header">
                                                    {deleting ? "Loading..." : "Proceed"}
                                                </p>
                                            </div>
                                        </div>

                                    </div>

                                </DialogPanel>
                            </div>
                        </div>
                </Dialog>
    )
}
export default DeleteUserModal
