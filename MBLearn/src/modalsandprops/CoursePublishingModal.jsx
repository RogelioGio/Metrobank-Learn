import { faBookBookmark, faClock, faPen, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import * as React from "react";
import { useState } from "react";

const CoursePublishingModal = ({open, close}) => {
    const [status,setStatus] = useState("published");
    return(
        <>
            <Dialog open={open} onClose={()=>{}}>
                <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40 backdrop-blur-sm" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[60vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                {/* Header */}
                                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                    <div>
                                        <h1 className="text-primary font-header
                                                    text-base
                                                    md:text-2xl">Publish Course</h1>
                                        <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-sm"> Finalize and publish a course, making it available for learners to access and enroll.</p>
                                    </div>
                                    <div>
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                        w-5 h-5 text-xs
                                                        md:w-8 md:h-8 md:text-base" onClick={close}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>
                                {/* Current Status */}
                                <div className="px-4 py-2 flex flex-col gap-y-2">
                                    <p className="text-unactive text-xs font-text">Current Course Status:</p>
                                    {
                                        <div className="rounded-md shadow-md w-full py-3 px-4 flex flex-row justify-between items-center gap-4">
                                            <div className="flex flex-col gap-y-1">
                                                <p className="font-header text-primary">{status === "published" ? "Published" : status === "unPublished" ? "Unpublished" : "Archived"}</p>
                                                <p className="font-text text-unactive text-xs">
                                                    {
                                                        status === "published" ? "This course is currently published and available for learners." :
                                                        status === "unPublished" ? "This course is currently unpublished and not available for learners and open for minor edits." :
                                                        "This course is archived and not available for learners."
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <div className="w-10 h-10 bg-primarybg rounded-full flex items-center justify-center text-primary">
                                                    <FontAwesomeIcon icon={status === "published" ? faBookBookmark : status === "unPublished" ? faPen : faTrash}/>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {/* Toggle Status */}
                                <div className="px-4 py-2 flex flex-col gap-y-2">
                                    <p className="font-text text-xs text-unactive">Toggle Course Status</p>

                                    <div className="flex flex-col gap-2
                                                    md:flex-row">
                                        {
                                            status === "unPublished" ? null :
                                            <div className="w-full group flex flex-row justify-between border-2 border-primary rounded-md shadow-md p-4 hover:cursor-pointer hover:bg-primary transition-all ease-in-out" onClick={()=>setStatus("unPublished")}>
                                                <div className="flex flex-col">
                                                    <div className="w-10 h-10 bg-primarybg rounded-full text-primary md:flex justify-center items-center group-hover:bg-white hidden mb-2">
                                                        <FontAwesomeIcon icon={faPen}/>
                                                    </div>
                                                    <p className="group-hover:text-white font-header text-sm text-primary">Unpublish Course</p>
                                                    <p className="group-hover:text-white font-text text-unactive text-xs">Allowing you to make updates and changes.</p>
                                                </div>
                                                <div className="w-10 h-10 bg-primarybg rounded-full text-primary flex justify-center items-center group-hover:bg-white md:hidden">
                                                    <FontAwesomeIcon icon={faPen}/>
                                                </div>
                                            </div>
                                        }
                                        {
                                            status === "published" ? null :
                                            <div className="w-full group flex flex-row justify-between border-2 border-primary rounded-md shadow-md p-4 hover:cursor-pointer hover:bg-primary transition-all ease-in-out" onClick={()=>setStatus("published")}>
                                                <div className="flex flex-col">
                                                    <div className="w-10 h-10 bg-primarybg rounded-full text-primary md:flex justify-center items-center group-hover:bg-white hidden mb-2">
                                                        <FontAwesomeIcon icon={faBookBookmark}/>
                                                    </div>
                                                    <p className="group-hover:text-white font-header text-sm text-primary">Publish Course</p>
                                                    <p className="group-hover:text-white font-text text-unactive text-xs">Allowing you to make updates and changes.</p>
                                                </div>
                                                <div className="w-10 h-10 bg-primarybg rounded-full text-primary flex justify-center items-center group-hover:bg-white md:hidden">
                                                    <FontAwesomeIcon icon={faBookBookmark}/>
                                                </div>
                                            </div>
                                        }
                                        {
                                            status === "archived" ? null :
                                            <div className="w-full group flex flex-row justify-between border-2 border-primary rounded-md shadow-md p-4 hover:cursor-pointer hover:bg-primary transition-all ease-in-out" onClick={()=>setStatus("archived")}>
                                                <div className="flex flex-col">
                                                    <div className="w-10 h-10 bg-primarybg rounded-full text-primary md:flex justify-center items-center group-hover:bg-white hidden mb-2">
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                    </div>
                                                    <p className="group-hover:text-white font-header text-sm text-primary">Archive Course</p>
                                                    <p className="group-hover:text-white font-text text-unactive text-xs">Removes the course from active listings.</p>
                                                </div>
                                                <div className="w-10 h-10 bg-primarybg rounded-full text-primary flex justify-center items-center group-hover:bg-white md:hidden">
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                </div>
                                            </div>
                                        }

                                    </div>

                                </div>

                                {/* Save */}
                                <div className="flex flex-row justify-between gap-2 mx-4 py-2">
                                    <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out">
                                        <p className="font-header">Cancel</p>
                                    </div>
                                    <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out `}>
                                        <p className="font-header">Save</p>
                                    </div>

                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default CoursePublishingModal
