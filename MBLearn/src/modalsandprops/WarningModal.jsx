import { faChevronLeft, faChevronRight, faCircleCheck, faExclamationTriangle, faGraduationCap, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { format } from "date-fns";
import { useState } from "react";

const WarningModal = ({open, close, proceed,selected = [], title, desc, loading}) => {


    return(
        <Dialog open={open} onClose={close}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                    w-[30vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pb-2 px-4 flex flex-col justify-center items-center w-full">
                                <div className="bg-primarybg w-20 h-20 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-primary"/>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="font-header text-primary text-xl">{title}</p>
                                    <p className="font-text text-primary text-xs">{desc}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 px-4 py-4 w-full">
                                <div>
                                    <p className="text-unactive font-text text-xs">Number of Entries: </p>
                                    <p className="font-header text-primary text-lg">{selected.length} Entries</p>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between gap-2 px-4">
                                <div className={`bg-white border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-primary transition-all ease-in-out cursor-pointer font-header hover:text-white hover:bg-primaryhover`}
                                onClick={()=>{close()}}>
                                    <p>Cancel</p>
                                </div>
                                <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                onClick={()=>{proceed()}}>
                                    {
                                        loading ?
                                        <p>Loading...</p>
                                        :
                                        <p>Proceed</p>
                                    }
                                </div>

                            </div>
                        </div>
                    </DialogPanel>

                </div>
            </div>
        </Dialog>
    )
}
export default WarningModal
