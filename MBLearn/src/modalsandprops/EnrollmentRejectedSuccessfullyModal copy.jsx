import { faChevronLeft, faChevronRight, faCircleCheck, faGraduationCap, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { format } from "date-fns";
import { useState } from "react";


const usePagination = (data, itemPerpage = 2) => {
    const [currentPage, setCurrentPage] = useState(1);

    const indexFirstItem = (currentPage - 1) * itemPerpage;
    const indexLastItem = Math.min(indexFirstItem + itemPerpage, data?.length);
    const currentPaginated = data?.slice(indexFirstItem, indexLastItem)
    const totalPage = Math.ceil(data?.length / itemPerpage)
    const totalitem = data?.length

    //Pagination Controll
    const goto = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPage) setCurrentPage(pageNum);
    }
    const next = () => {
        // setCurrentPage((prev) => Math.min(prev + 1, totalPage));
        if (currentPage < totalPage) setCurrentPage(currentPage + 1)
    };

    const back = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return {
        currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back
    }
}

const EnrollmentRejectedSuccessfully = ({open, close, result, course, duration, learner, date, tab }) => {

    const {currentPaginated,
    currentPage,
    totalPage,
    indexFirstItem,
    indexLastItem,
    totalitem,
    goto,
    next,
    back} = usePagination(result,5)

    return(
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                    w-[50vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pb-2 px-4 flex flex-col justify-center items-center w-full">
                                <div className="bg-primarybg w-20 h-20 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-primary"/>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="font-header text-primary text-xl">Request Enrollment Rejected</p>
                                    <p className="font-text text-primary text-xs">The Learners chosen has been rejected thier enrollment request</p>
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
                                    <p className="text-unactive font-text text-xs">Number of learner rejected: </p>
                                    <p className="font-header text-primary">{learner?.length} Learners</p>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between gap-2 px-4">
                                <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                onClick={()=>{close()}}>
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
export default EnrollmentRejectedSuccessfully
