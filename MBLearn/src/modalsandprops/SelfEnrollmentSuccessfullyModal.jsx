import { faGraduationCap, faTrash, faUserPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import axiosClient from "../axios-client"
import { useEffect, useState } from "react"

const SelfEnrollmentSuccessfullyModal = ({open,close,course}) => {
    return (
        <Dialog open={open} onClose={close}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50" />
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className='bg-white rounded-md h-full w-[45vw] p-5 flex flex-col items-center justify-center'>
                            {/* Header */}
                                <div className="py-4 mx-4 border-divider flex flex-col items-center justify-center gap-2">
                                    <div className="w-fit aspect-square bg-secondaryprimary rounded-full text-center">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-2xl p-6"/>
                                    </div>
                                    <div className="text-center flex-col flex gap-2">
                                        <h1 className="text-primary font-header text-2xl">Request Created SuccessFully</h1>
                                        <p className="text-unactive font-text text-sm">Congratuilations!, you have created an enromment request for: </p>
                                        <p className="text-primary font-text text-sm">{course?.courseName} </p>
                                    </div>
                                </div>
                                <div className="text-center flex-col flex p-4 w-full bg-primary rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover ease-in-out transition-all"
                                    onClick={close}>
                                    <p className="font-header text-white">Close</p>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>

    )
}
export default SelfEnrollmentSuccessfullyModal
