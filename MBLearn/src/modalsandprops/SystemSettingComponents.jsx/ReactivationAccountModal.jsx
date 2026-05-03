import { faUserClock, faUserPen, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useOption } from "MBLearn/src/contexts/AddUserOptionProvider"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider"
import { useUser } from "MBLearn/src/contexts/selecteduserContext"
import { useEffect, useState } from "react"
import dayjs from "dayjs";
import { toast } from "sonner"
import axiosClient from "MBLearn/src/axios-client"
import { format } from "date-fns"
import ConfirmReactivation from "../ConfirmReactivation"

const ReactivationAccountModal = ({open, close, fetchUsers, users}) => {
    const [loading, setLoading] = useState(false)
    const {cities,departments,location,titles,roles,permission} = useOption();
    const [reactivating, SetReactivating] = useState();
    const [confirm, setConfirm] = useState(false);

    // useEffect(() => {
    //         if (open && id) {
    //             if (selectedUser?.id === id) {
    //                 setLoading(false);
    //             } else {
    //                 setLoading(true);
    //                 selectUser(id);
    //             }
    //         }
    //     }, [id, selectedUser, open]);
    //     useEffect(() => {
    //         if (selectedUser && !isFetching) {
    //             setLoading(false);
    //         }
    //     }, [selectedUser, isFetching]);

    useEffect(() => {
        console.log(users)
    }, [users]);



    const handleReactivation = () => {
        SetReactivating(true)
        axiosClient.put(`/restore-user/${users.id}`)
        .then(()=>{
            toast.success("User Reactivated", {
                description: "The selected is reactivated in the system"
            })
            close()
            fetchUsers(),
            setTimeout(() => {
                SetReactivating(false)
            },500)
        }).catch(() => {
            SetReactivating(false)
        })
        // setTimeout(()=>{close();refresh},1000)
        // setTimeout(() => {
        //     SetReactivating(false)
        // },1500)
    }

    return(
        <>
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-20"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        lg:w-[60vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                {/* Header */}
                                <div className='pb-4 mx-4 border-b border-divider flex flex-row justify-between item-center gap-2'>
                                    <div>
                                        <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Account Reactivation</h1>
                                        <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Reactivate deactivated user accounts, restoring their access and system permissions</p>
                                    </div>
                                    <div>
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                        w-5 h-5 text-xs
                                                        md:w-8 md:h-8 md:text-base"
                                            onClick={()=>{
                                                close()
                                            }}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>

                                </div>
                                <div className="grid grid-cols-4 mx-4 py-4">
                                    <div className="col-span-2 flex justify-between border-b pb-4 border-divider">
                                        <div className="flex flex-row gap-2 font-text items-center">
                                            <img src={users?.profile_image} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full"/>
                                            <div>
                                                <p className="">{users?.first_name} {users?.middle_name || ""} {users?.last_name || ""}</p>
                                                <p className="text-xs text-unactive">{users?.user_credentials.MBemail}</p>
                                                <p className="text-xs text-unactive">ID: {users?.employeeID}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end col-span-2 border-b pb-4 border-divider">
                                        <p className="text-xs text-unactive">Last Log-in Timestamp</p>
                                        <p className="font-text">
                                            {
                                                users?.user_credentials.last_logged_in ? format(new Date(users?.user_credentials.last_logged_in), "MMMM dd yyyy") : "Not Log-in yet"
                                            }
                                        </p>
                                    </div>

                                    <div className="col-span-4 py-2 border-b border-divider hidden md:grid grid-cols-3 gap-3">
                                        <div className="font-text">
                                            <p className="text-xs text-unactive">Division</p>
                                            <p>{users?.title?.department?.division?.division_name || "No Data"}</p>
                                        </div>
                                        <div className="font-text">
                                            <p className="text-xs text-unactive">Department</p>
                                            <p>{users?.title?.department?.department_name || "No Data"}</p>
                                        </div>
                                        <div className="font-text">
                                            <p className="text-xs text-unactive">Title</p>
                                            <p>{users?.title?.title_name || "No Data"}</p>
                                        </div>
                                    </div>

                                    <div className="py-2 col-span-4 font-text border-b border-divider">
                                        <p className="text-xs text-unactive">Branch city and Location</p>
                                        <p>{users?.city?.city_name || "No Data"}</p>
                                        <p className="text-xs">{users?.branch?.branch_name || "No Data"}</p>
                                    </div>

                                    <div className="py-1 pt-2 col-span-2 font-text">
                                        <p className="text-xs text-unactive">Account Role</p>
                                        <p>{users?.roles[0]?.role_name || "No Data"}</p>
                                    </div>
                                    <div className="py-1 pt-2 col-span-2 font-text flex flex-col items-end">
                                        <p className="text-xs text-unactive">Account Status</p>
                                        <p>{users?.status}</p>
                                    </div>

                                    <div className="py-1 pb-2 col-span-2 font-text">
                                        <p className="text-xs text-unactive">Account Added</p>
                                        <p>
                                            {
                                                users?.created_at ? format(new Date(users?.created_at),"MMMM dd yyyy") : null
                                            }
                                        </p>
                                    </div>
                                    <div className="py-1 pb-2 col-span-2 font-text flex flex-col items-end">
                                        <p className="text-xs text-unactive">Account Deleted</p>
                                        <p>
                                            {
                                                users?.updated_at ? format(new Date(users?.updated_at),"MMMM dd yyyy") : null
                                            }
                                        </p>
                                    </div>

                                </div>


                                {/* Buttons */}
                                <div className="flex flex-row gap-2 px-4">
                                    <div className="font-header w-full border-2 border-primary rounded-md py-3 flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                        onClick={()=>{close()}}>
                                        Cancel
                                    </div>
                                    <div className={`font-header bg-primary text-white w-full border-2 border-primary rounded-md py-3 flex flex-row justify-center shadow-md transition-all ease-in-out ${reactivating ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:text-white"}`}
                                        onClick={()=>{
                                            if(reactivating) return
                                            setConfirm(true)
                                        }}>
                                        {
                                            reactivating ? "Reactivating..." : "Re-Activate"
                                        }
                                    </div>
                                </div>
                                {/* <div className="pb-4 mx-4 flex flex-row gap-2">
                                    <div className="w-full inline-flex flex-col items-center gap-2 p-4 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out" onClick={close}>
                                        Cancel
                                    </div>
                                    <div className="w-full inline-flex flex-col items-center gap-2 bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out" onClick={()=>handleReactivation()}>
                                        {reactivating ? "Reactivating..." : "Reactivate Account"}
                                    </div>
                                </div> */}
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>

        <ConfirmReactivation open={confirm} close={()=>{setConfirm(false)}} handleReactivation={()=>handleReactivation()}/>
        </>
    )
}
export default ReactivationAccountModal
