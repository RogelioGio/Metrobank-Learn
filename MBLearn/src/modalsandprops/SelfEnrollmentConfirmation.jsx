import { faGraduationCap, faTrash, faUserPen, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import axiosClient from "../axios-client"
import { useEffect, useState } from "react"
import { format } from "date-fns"


const SelfEnrollmentCourseConfirmation = ({open, close, course, date, proceed}) => {
    return (
        <Dialog open={open} onClose={close}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50" />
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className='bg-white rounded-md h-full w-[50vw] p-9 flex flex-col items-center justify-center gap-4'>
                                {/* Header */}
                                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center w-full">
                                    <div>
                                        <h1 className="text-primary font-header
                                                    text-base
                                                    md:text-2xl">Confirm Request</h1>
                                        <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-sm">Review the request for the self course enrollment</p>
                                    </div>
                                    <div className="">
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
                                <div className="flex flex-row justify-between items-center w-full">
                                    <div>
                                        <p className="font-text text-unactive text-xs">Course Name:</p>
                                        <p className="font-header text-primary">{course?.courseName}</p>
                                        <p className="font-text text-unactive text-xs">{course?.courseID} ({course?.categories?.category_name} - {course?.career_level?.name} Level)</p>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.training_type?.charAt(0).toUpperCase()}{course?.training_type?.slice(1)} </span>
                                    </div>
                                </div>
                                {/* <div className="flex flex-col w-full gap-2">
                                    <p className="font-text text-unactive text-xs">Training Duration:</p>
                                    <div className="flex flex-row justify-between">
                                        <div className="w-full">
                                            <p className="font-header text-primary">{date?.from ? format(new Date(date?.from), "MMMM dd yyyy") : null}</p>
                                            <p className="font-text text-xs">Starting Date</p>
                                        </div>
                                        <div className="w-full">
                                            <p className="font-header text-primary">{date?.to ? format(new Date(date?.to), "MMMM dd yyyy") : null}</p>
                                            <p className="font-text text-xs">Ending Date</p>
                                        </div>
                                    </div>
                                </div> */}
                                <div className="w-full flex flex-row items-center justify-between gap-1">
                                        <div className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header"
                                        onClick={()=>{close()}}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                            onClick={()=>{proceed()}}>
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

export default SelfEnrollmentCourseConfirmation
