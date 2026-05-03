import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const SelfEnrollmentModal = ({open, onClose, course, setDuration, enrolling}) => {
    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40'>
                            <div className='bg-white rounded-md h-full p-5 grid grid-row-4 grid-cols-3 w-[75vw]'>
                                 {/* Header */}
                                    <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 col-span-3 justify-between">
                                        <div className="flex flex-col">
                                            <p className="font-text text-unactive text-xs">Course Name:</p>
                                            <div>
                                                <p className="font-header text-primary text-3xl">{course?.name}</p>
                                                <p className="font-text text-xs text-unactive">Course ID: {course?.CourseID}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start justify-start">
                                            <div className="flex items-center justify-center w-8 aspect-square border-2 border-primary rounded-full text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition-all ease-in-out" onClick={onClose}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="grid grid-cols-3 gap-2 px-5 col-span-3 py-2">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-text text-unactive text-xs">Contributor:</p>
                                            <div className="flex flex-row gap-2 items-center">
                                                <div className="w-10 h-10 bg-primary rounded-full">
                                                    <img src={course?.adder?.profile_image} alt="" className="rounded-full"/>
                                                </div>
                                                <div>
                                                    <p className="font-header text-primary">{course?.adder?.first_name} {course?.adder?.middle_name} {course?.adder?.last_name}</p>
                                                    <p className="font-text text-xs text-unactive">ID: {course?.adder?.employeeID} </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-text text-unactive text-xs">Author:</p>
                                            <div className="flex flex-row gap-2 items-center">
                                                <div className="w-10 h-10 bg-primary rounded-full">
                                                    <img src="" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-header text-primary">Contributor Name</p>
                                                    <p className="font-text text-xs text-unactive">ID: 012345789</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Description */}
                                    <div className="flex flex-col gap-1 px-5 col-span-3 py-2">
                                            <p className="font-text text-unactive text-xs">Description:</p>
                                            <p className="font-text text-black">This course provides a comprehensive introduction to web application development using Laravel, one of the most popular PHP frameworks. Designed for aspiring web developers and backend engineers, the course covers the fundamentals of Laravel’s MVC architecture, routing, middleware, templating with Blade, database interactions using Eloquent ORM, authentication, and API development. Through hands-on projects and real-world examples, students will gain the skills necessary to build scalable, secure, and maintainable web applications. By the end of the course, participants will be able to develop and deploy full-stack Laravel applications from scratch.</p>
                                    </div>

                                    {/* Action */}
                                    <div className='col-span-3 flex justify-center gap-4 py-1 px-5'>
                                            {/* Cancel */}
                                            <button className='bg-white b p-4 outline outline-2 outline-primary outline-offset-[-2px] rounded-md font-header uppercase text-primary text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 hover:text-white hover:outline-primaryhover transition-all ease-in-out w-full' onClick={()=>onClose()}>
                                                <p>Cancel</p>
                                            </button>
                                            {/* Submit */}
                                            <input type="submit"
                                                    value="Enroll"
                                                    className="bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out w-full" onClick={()=>{setDuration()}}/>
                                        </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>

        </Dialog>
    )
}
export default SelfEnrollmentModal;
