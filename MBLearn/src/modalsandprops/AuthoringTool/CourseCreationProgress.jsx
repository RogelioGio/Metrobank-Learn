import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { RingProgress } from "@mantine/core";
import { useState } from "react";


const CourseCreationProgress = ({open, close, course, module, progress}) => {

    const hasCreditorSignature = course?.certificates?.some(cert =>
        cert.creditors?.some(c => c.SignatureURL_Path)
    );

    const hasModule = module.some(item => item.type === "module");
    const hasAssessment = module.some(item => item.type === "assessment");

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                                            w-[80vw]
                                                                            md:w-[50vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col gap-2'>
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Course Creation Status</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Review the current course development and check each requirement</p>
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
                            <div className="mx-4 flex flex-row items-center justify-between gap-4 mt-4">
                                <div>
                                    <span className="font-text text-xs bg-primarybg text-primary px-4 py-1 rounded-full border-primary border">{course?.TrainingType?.charAt(0).toUpperCase()}{course?.TrainingType?.slice(1)}</span>
                                    <p className="font-header text-primary">{course?.CourseName}</p>
                                    <p className="text-xs font-text">{course?.CourseID} | {course?.category?.category_name} - {course?.career_level?.name} Level</p>
                                </div>
                                <div className="flex flex-row ">
                                    <div className="flex flex-col items-end justify-center mr-4 leading-none">
                                        <p className="font-header text-xl text-primary">{progress}%</p>
                                        <p className="font-text text-xs text-unactive">Creation Progress</p>
                                    </div>
                                    <RingProgress
                                        size={50}
                                        thickness={8}
                                        sections={[{ value: progress || 0, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                        rootColor="hsl(210, 14%, 83%)" // Lighter gray background
                                        />
                                </div>
                            </div>
                            <div className="mx-4 flex flex-col pb-4">
                                <div className="flex flex-col  pb-4 pt-2">
                                    <p className="font-text text-xs">Course Requirements:</p>
                                    <p className="text-unactive font-text text-xs">These requirement must be achieve before submitting and Course Draft.</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${hasModule ? " bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={`${hasModule ? " text-white" : "text-divider"}`}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Lessons</p>
                                            <p className="font-text text-xs">The created course must include atleast one lesson inside</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${hasAssessment ? " bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={`${hasAssessment ? " text-white" : "text-divider"}`}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Assessment</p>
                                            <p className="font-text text-xs">The created course must include atleast one assessment inside</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`min-w-8 min-h-8 rounded-full border flex items-center justify-center ${hasCreditorSignature ? "bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={hasCreditorSignature ? "text-white" : "text-divider"} />
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Certificate</p>
                                            <p className="font-text text-xs">The created course must include a unique and configured certificate to be awarded to the learner's completion</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${course?.Objective ? " bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={`${course?.Objective  ? " text-white" : "text-divider"}`}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Objective</p>
                                            <p className="font-text text-xs">The created course must entail its objective and goal why it is created</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${course?.Overview ? " bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={`${course?.Overview ? " text-white" : "text-divider"}`}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Overview</p>
                                            <p className="font-text text-xs">The created course must entail its overview that includes what is the summary of the course</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${course?.ImagePath ? "bg-primary border-primary" : "bg-white border-divider"}`}>
                                            <FontAwesomeIcon icon={faCheck} className={`${course?.ImagePath ? "text-white" : "text-divider"}`} />
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Thumbnail</p>
                                            <p className="font-text text-xs">The created course must include a thumbnail for display purposes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default CourseCreationProgress;
