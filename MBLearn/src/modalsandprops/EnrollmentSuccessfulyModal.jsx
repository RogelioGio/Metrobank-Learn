import { faArrowLeft, faArrowRight, faChevronLeft, faChevronRight, faGraduationCap, faUserPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import React from "react"
import { useEffect, useState } from "react"

const usePagination = (data, itemPerpage = 1) => {
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

const EnrolledSuccessfullyModal = ({ isOpen, onClose, result, course, duration}) => {
    const [selectedCourse, setSelectedCourse] = useState();
    const [selectedEnrollees, setSelectedEnrolees] = useState();
    const [selectedCourses, setSelectedCourses] = useState()
    const {currentPaginated: enrollees,
            currentPage: currentEnrollees,
            totalPage: totalPageEnrollee,
            indexFirstItem: firstEnrollee,
            indexLastItem: lastEnrollee,
            totalitem: totalEnrollee,
            goto: goToEnrollee,
            next: nextEnrollee,
            back: backEnrollee
        } = usePagination(selectedEnrollees,5)
    const {currentPaginated: courses,
        currentPage: currentCourses,
        totalPage: totalPageCourse,
        indexFirstItem: firstCourse,
        indexLastItem: lastCourse,
        totalitem: totalCourse,
        goto: goToCourse,
        next: nextCourse,
        back: backCourse
    } = usePagination(selectedCourses,3)
    useEffect(() => {
        setSelectedCourse(result[0]?.course.id)
        setSelectedEnrolees(result.find((result)=> result.course.id === selectedCourse)?.enrollees)
        setSelectedCourses(result.map(entry => entry.course))
    },[result,isOpen])


    return(
        <Dialog open={isOpen} onClose={() => {}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='w-[75vw] relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col justify-center'>
                                {/* Header */}
                                <div className="py-4 mx-4 border-b border-divider flex flex-row justify-between item-center gap-4">
                                    <div>
                                        <h1 className="text-primary font-header text-3xl">Enrollment Successfully</h1>
                                        <p className="text-unactive font-text text-md">All selected user are successfully enrolled to the given selected assigned courses</p>
                                    </div>
                                    <div className="bg-primarybg p-5 rounded-full">
                                        <div className="h-full w-fit aspect-square flex items-center justify-center">
                                            <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-lg"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Courses */}
                                <div className="mx-4 py-2">
                                    <p className="text-xs text-unactive font-text pb-2">Selected Courses:</p>
                                    {/* Must put slider or pagination next time */}
                                    <div className="grid grid-cols-3 gap-2 grid-row-1 pb-2">
                                        {/* Sample */}
                                        {/* ${course === name ? 'bg-primary text-white' : 'bg-white text-primary'} */}
                                        {
                                            courses?.map((course, index) => (
                                                <div key={course.id} className={`text-primary w-full p-3 grid grid-cols-[auto_3.75rem] border border-divider rounded-md font-text shadow-md hover:cursor-pointer hover:scale-105 transition-all ease-in-out ${selectedCourse === course.id ? "bg-primary !text-white": null} `} onClick={() => {setSelectedCourse(course.id), setSelectedEnrolees(result.find((result)=> result.course.id === course.id)?.enrollees)}}>
                                                    <div className="pb-2 flex justify-between w-full col-span-2">
                                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                            {course.training_type}
                                                        </span>
                                                        <div className=" bg-[#1664C0] rounded-full text-white flex items-center justify-center aspect-square">
                                                            <p className="text-xs px-3">{result.find((result)=> result.course.id === course.id)?.enrollees.length  || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <h1 className="text-sm font-header">{course.name}</h1>
                                                        <p className="text-xs">{course.types[0].type_name} - {course.categories[0].category_name}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="flex flex-row justify-between">
                                        <div className="border-2 border-primary p-1 px-2 aspect-square rounded-md shadow-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white"
                                            onClick={backCourse}>
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div className="flex flex-row items-center gap-2">
                                                {
                                                    Array.from({length: totalPageCourse}).map((_,i) => (
                                                        <div key={i} className={`w-2 h-2 rounded-full ${i+1 === currentCourses ? 'bg-primary': 'bg-unactive'}`}/>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="border-2 border-primary p-1 px-2 aspect-square rounded-md shadow-md text-primary hover:bg-primary hover:cursor-pointer hover:text-white"
                                            onClick={nextCourse}>
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </div>
                                    </div>
                                </div>

                                {/* Enrolled User Table */}
                                <div className="mx-4 py-2">
                                    <p className="text-xs text-unactive font-text pb-2">Enrolled Employees:</p>
                                    <div className="className='w-full border-primary border rounded-md overflow-hidden shadow-md'">
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                                    <tr>
                                                        <th className='py-4 px-4'>EMPLOYEE NAME</th>
                                                        <th className='py-4 px-4'>DEPARTMENT</th>
                                                        <th className='py-4 px-4'>BRANCH</th>
                                                    </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                            {
                                                // result.filter((result)=> result.course.id === selectedCourse)
                                                enrollees?.map((enrollee) => (
                                                    <tr key={enrollee.id} className='font-text text-sm hover:bg-gray-200 hover:cursor-pointer'>
                                                        <td className='text-sm py-3 px-4'>
                                                            <div className="flex items-center gap-4">
                                                                <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                                                <img src={enrollee.profile_image} alt="" className='rounded-full'/>
                                                                </div>
                                                                <div>
                                                                    <p className='font-text'>{enrollee.first_name} {enrollee.middle_name} {enrollee.last_name} {enrollee.name_suffix}</p>
                                                                    <p className='text-unactive text-xs'>ID: {enrollee.employeeID}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='py-3 px-4'>
                                                            <div className='flex flex-col'>
                                                                {/* Department */}
                                                                <p className='text-unactive'>{enrollee.department.department_name}</p>
                                                                {/* Title */}
                                                                <p className='text-unactive text-xs'>{enrollee.title.title_name}</p>
                                                            </div>
                                                        </td>
                                                        <td className='py-3 px-4'>
                                                            <div className='flex flex-col'>
                                                            {/* Branch Location */}
                                                            <p className='text-unactive'>{enrollee.branch.branch_name}</p>
                                                            {/* City Location */}
                                                            <p className='text-unactive text-xs'>{enrollee.city.city_name}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mx-4 py-2 flex flex-row justify-between items-center">
                                    <p className='text-sm font-text text-unactive'>
                                        Showing <span className='font-header text-primary'>{firstEnrollee + 1}</span> to <span className='font-header text-primary'>{lastEnrollee}</span> of <span className='font-header text-primary'>{totalEnrollee}</span> <span className='text-primary'>results</span>
                                    </p>

                                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                        {/* Previous */}
                                        <a
                                            onClick={backEnrollee}
                                            className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                            <FontAwesomeIcon icon={faChevronLeft}/>
                                        </a>

                                        {/* Current Page & Dynamic Paging */}
                                        {
                                            Array.from({ length: totalPageEnrollee }, (_, i) => (
                                                <a
                                                    key={i}
                                                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                        ${
                                                            currentEnrollees === i + 1
                                                            ? 'bg-primary text-white'
                                                            : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                        } transition-all ease-in-out`}
                                                    onClick={() => goToEnrollee(i + 1)}
                                                >
                                                    {i + 1}
                                                </a>))
                                        }
                                        {/*
                                        */}
                                        <a
                                            onClick={nextEnrollee}
                                            className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                            <FontAwesomeIcon icon={faChevronRight}/>
                                        </a>
                                    </nav>
                                </div>

                                {/* Confirm Button */}
                                <div className="mx-4 py-2 font-header">
                                    <button className="w-full bg-primary text-white rounded-md p-2 hover:scale-105 transition-all ease-in-out" onClick={onClose}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    )
}

export default EnrolledSuccessfullyModal
