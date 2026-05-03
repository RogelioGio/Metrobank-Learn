import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import axiosClient from "../axios-client"
import { useEffect, useState } from "react"
import { useOption } from "../contexts/AddUserOptionProvider"
import { useUser } from "../contexts/selecteduserContext"
import { useFormik } from "formik"
import { text } from "@fortawesome/fontawesome-svg-core"


const ConfirmingDeletingUser = ({open,close,classname,selectedUser, handlePermDeleting}) => {
    const {departments,titles,location,cities,division,section} = useOption();

    const confirm = useFormik({
        initialValues: {
            text: '',
        }
    });

    const confirmDelete = () => {
        if(confirm.values.text === `MBLEARN-DELETE-${selectedUser?.first_name?.replace(/\s+/g, '') || ""}-${selectedUser?.employeeID || ""}`){
            handlePermDeleting();
            close();
        }
    }


    return(
            <Dialog open={open} onClose={()=>{}} className={classname}>
                <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30" />
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[50vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                {/* Header */}
                                    <div className="py-4 mx-4 flex flex-row justify-between item-center gap-6 border-b border-divider">
                                        <div>
                                                <h1 className="text-primary font-header
                                                                text-base
                                                                md:text-2xl">Warning!</h1>
                                                <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Please read the consequences before deleting the selected user</p>
                                            </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4">
                                        <p className="font-text text-sm">You are about to permanently delete this user and all their associated data, including <span className="font-header text-red-600">enrollments, progress, certifications, and records.</span>
                                            This action will also remove their access credentials and activity logs. Once deleted, the data <span className="font-header text-red-600">cannot be recovered</span> and may affect past reports or analytics.
                                            Please ensure all important information is backed up before proceeding.</p>
                                        <p className="font-text text-sm">To continue delation of user, Type <span className="font-header">MBLEARN-DELETE-{selectedUser?.first_name?.replace(/\s+/g, '') || ""}-{selectedUser?.employeeID || ""}</span> and click confirm to continue the
                                        deletion of the user</p>
                                    </div>
                                    <form onSubmit={confirm.handleSubmit} className="w-full px-4">
                                        <div className="inline-flex flex-col gap-1 md:col-span-3 w-full">
                                            <input type="text" name="text"
                                                                value={confirm.values.employeeID}
                                                                onChange={confirm.handleChange}
                                                                onBlur={confirm.handleBlur}
                                                                onPaste={(e) => e.preventDefault()}
                                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {confirm.touched.text && confirm.errors.text ? (<div className="text-red-500 text-xs font-text">{confirm.errors.text}</div>):null}
                                        </div>
                                    </form>
                                    <div className="flex flex-row justify-between items-center mx-4 py-2 gap-1">
                                        <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out font-header"
                                            onClick={()=>{
                                                close()
                                            }}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white font-header hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out  ${
                                                confirm.values.text !== `MBLEARN-DELETE-${selectedUser?.first_name?.replace(/\s+/g, '')}-${selectedUser?.employeeID}`
                                                ? "opacity-50 hover:cursor-not-allowed"
                                                : ""
                                            }`}
                                            onClick={()=>{
                                                confirmDelete();
                                            }}>
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

export default ConfirmingDeletingUser
