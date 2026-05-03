import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"


const ConfirmEnrollement = ({open, close, course, date, learner, handleEnrollment}) => {
    return (
        <Dialog open={open} onClose={()=>{}}>
                    <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[50vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Confirm Enrollment</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Review the enrollement with the given information</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 px-4 py-4">
                                        <div className="flex flex-row items-center justify-between">
                                            <div>
                                                <p className="font-text text-unactive text-xs">Course Name:</p>
                                                <p className="font-header text-primary">{course.courseName}</p>
                                                <p className="font-text text-unactive text-xs">{course.courseID} ({course.categories.category_name} - {course.career_level.name} Level)</p>
                                            </div>
                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit"> {course.training_type} </span>
                                        </div>
                                        <div>
                                            <p className="text-unactive font-text text-xs">Number of learner about to be enrolled: </p>
                                            <p className="font-header text-primary">{learner.length} Learners</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-unactive font-text text-xs">Training Duration</p>
                                            <div className="flex flex-row">
                                                <div className="w-full flex flex-col">
                                                    <p className="font-header text-primary">{date.from ? format(new Date(date.from), "MMMM dd yyyy"):""}</p>
                                                    <p className="font-text text-xs">Starting Date</p>
                                                </div>
                                                <div className="w-full flex flex-col">
                                                    <p className="font-header text-primary">{date.to ? format(new Date(date.to), "MMMM dd yyyy"):""}</p>
                                                    <p className="font-text text-xs">End Date</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-row items-center justify-between gap-1 px-4">
                                        <div className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header"
                                        onClick={()=>{close()}}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                            onClick={()=>{handleEnrollment()}}>
                                            <p>Enroll</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
        </Dialog>
    )
}

export default ConfirmEnrollement
