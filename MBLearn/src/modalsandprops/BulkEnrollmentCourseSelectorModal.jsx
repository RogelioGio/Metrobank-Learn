import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useEffect, useRef, useState } from "react"
import axiosClient from "../axios-client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faFilter, faMagnifyingGlass, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import AssignedCourseEnrollmentCard from "./AssignedCourseEnrollmentCard"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";

const BulkEnrollmentCourseSelectorModal = ({ open, close, courselist, currentCourse, setCurrentCourse, courseType, setCourseType, resetPagination,loading, learnerloading, numberOfEnrollees, pageState, changePageState}) => {
    const Pages = []
    for(let p = 1; p <= pageState.lastPage; p++){
        Pages.push(p)
    }

    const back = () => {
        if (loading) return;
        if (pageState.currentPage > 1){
            changePageState("currentPage", pageState.currentPage - 1)
            //changePageState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (loading) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    const pageChange = (page) => {
        if(loading) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }


    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        lg:w-[75vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Select Course</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Select any assigned or inputted courses to enroll a learner</p>
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

                            <div className="grid grid-cols-4 pb-2 px-3">
                                <div className="flex items-center justify-center col-span-4 pb-2
                                                md:pb-0 md:col-span-1">
                                    <Select value={courseType} onValueChange={(value) => setCourseType.setFieldValue("filter", value)} className="w-full h-full" disabled={loading || learnerloading}>
                                        <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full">
                                            <SelectValue placeholder="Learner Type" />
                                        </SelectTrigger>
                                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                            <SelectItem value="myCourses">My Courses</SelectItem>
                                            <SelectItem value="Assigned">Assigned Courses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-row justify-end items-center gap-2 col-span-4
                                                md:pt-2 md:col-span-2 md:col-start-3">
                                    <div>
                                        <div className="min-h-10 min-w-10 bg-white text-primary flex items-center justify-center rounded-md shadow-md border-2 border-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out">
                                            <FontAwesomeIcon icon={faFilter}/>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <form>
                                            <div className="border-primary inline-flex flex-row place-content-between border-2 font-text rounded-md shadow-md w-full">
                                                <input type="text" className='focus:outline-none text-sm px-4 rounded-md bg-white w-full' placeholder='Search...'
                                                    name='search'
                                                    //value={searchFormik.values.search}
                                                    //onChange={searchFormik.handleChange}
                                                    // onKeyDown={(e) => {
                                                    //     if (e.key === 'Enter') {
                                                    //         e.preventDefault();
                                                    //         searchFormik.handleSubmit();
                                                    //     }
                                                    // }}
                                                    />
                                                <div className="min-h-10 min-w-10 bg-primary text-white flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faMagnifyingGlass}/>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 px-3 py-2 grid-cols-1
                                            md:grid-rows-2 md:grid-cols-3">
                                {
                                    loading ? (
                                        Array.from({ length: 6 }).map((_, index) => (
                                            <div className="rounded-md border p-4 shadow-md h-36 w-full animate-pulse bg-white" key={index}/>
                                        ))
                                    ) :
                                    courselist.length === 0 ?
                                                <div className="col-span-3 row-span-2 p-10 font-text text-unactive text-center flex flex-col items-center justify-center gap-2">
                                                    {
                                                        courseType === "myCourses" ?
                                                            <>
                                                                <div>
                                                                    <div className="w-14 h-14 rounded-full bg-primarybg text-primary text-2xl flex items-center justify-center">
                                                                        <FontAwesomeIcon icon={faXmark}/>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm">You have no inputted courses yet</p>
                                                            </>
                                                        : courseType === "Assigned" ?
                                                            <>
                                                                <div>
                                                                    <div className="w-14 h-14 rounded-full bg-primarybg text-primary text-2xl flex items-center justify-center">
                                                                        <FontAwesomeIcon icon={faXmark}/>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm">You have no assigned courses yet</p>
                                                            </>
                                                        : <p className="text-sm">No courses found</p>
                                                    }
                                                </div>
                                            :
                                            courselist.map((course, index) => (
                                                <AssignedCourseEnrollmentCard key={index} AssignedCourse={course} selected={currentCourse} learnerLoading={learnerloading} onclick={()=>{
                                                    if(learnerloading) return;
                                                    setCurrentCourse(course), resetPagination() ,setTimeout(()=>{close()},100)
                                                }} numberOfEnrollees={numberOfEnrollees(course)}/>))
                                        }
                            </div>

                            {/* Pagination */}
                            <div className="px-4 col-span-4 flex flex-row justify-between items-center">
                                <div className="flex flex-row items-center">
                                    {
                                        loading ? <>
                                        <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2 text-unactive' />
                                        <p className='text-sm font-text text-unactive'>Retrieving Courses...</p>
                                        </>
                                        : courselist.length === 0 ?
                                        <p className='text-sm font-text text-unactive'>No courses found</p>
                                        :<p className='text-sm font-text text-unactive'>
                                        Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalCourse}</span> total courses
                                        </p>
                                    }
                                </div>
                                {
                                    courselist.length !== 0 ?
                                    <div>
                                        <nav className={`isolate inline-flex -space-x-px round-md shadow-xs`}>
                                            {/* Previous */}
                                            <a  onClick={back}
                                                className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {Pages.map((page)=>(
                                                <a
                                                    key={page}
                                                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                        ${
                                                            loading ? "opacity-50 cursor-not-allowed" :
                                                            page === pageState.currentPage
                                                            ? 'bg-primary text-white'
                                                            : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                        } transition-all ease-in-out`}
                                                        onClick={() => pageChange(page)}>
                                                    {page}</a>
                                            ))}
                                            {/* Next */}
                                            <a
                                                onClick={next}
                                                className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>
                                    </div> : null
                                }
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
export default BulkEnrollmentCourseSelectorModal
