import { faCalendar, faChevronLeft, faChevronRight, faClock, faUserPen, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { add, differenceInDays, format } from "date-fns";
import { useEffect } from "react";
import { useState } from "react";
import { useFormik } from "formik";

function normalizationDuration(values, setField) {
    let months = parseInt(values.months) || 0;
    let weeks = parseInt(values.weeks) || 0;
    let days = parseInt(values.days) || 0;

    if (weeks >= 4) {
        const addMonths = Math.floor(weeks / 4);
        months += addMonths;
        weeks = weeks % 4;
    }

    if (days >= 7) {
        const addWeeks = Math.floor(days / 7);
        weeks += addWeeks;
        days = days % 7;
    }

    if (weeks >= 4) {
        const addMonths = Math.floor(weeks / 4);
        months += addMonths;
        weeks = weeks % 4;
    }

    setField('months', months > 0 ? months : '');
    setField('weeks', weeks > 0 ? weeks : '');
    setField('days', days > 0 ? days : '');
}

const BulkEnrollmentCourseDuration = ({open, close, result, selected, setSelected, setResults, handleEnrollment, enrolling}) => {
    const [selectedCourse, setSelectedCourse] = useState();
    const [course, setCourse] = useState();
    const [duration, setDuration] = useState({
            months: result[0]?.course.months,
            weeks: result[0]?.course.weeks,
            days: result[0]?.course.days,
        })

    const [date, setDate] = React.useState({
        from: new Date(),
        to: undefined,
    });


    useEffect(()=> {
        console.log(duration)
        console.log(course)
        console.log(date)
        console.log(selected)
    },[duration, course, open])

    useEffect(() => {
        setSelectedCourse(result[0]?.course.id)
        setCourse(result[0]?.course)

        const course = result[0]?.course;

        const from = new Date();
        const months = result[0]?.course.months || 0;
        const weeks = result[0]?.course.weeks || 0;
        const days = result[0]?.course.days || 0;

        const to = add(from, {
            months,
            weeks,
            days,
        });

        formik.setFieldValue('months', course?.months);
        formik.setFieldValue('weeks', course?.weeks);
        formik.setFieldValue('days', course?.days);

        setDate({ from, to });
    },[open])

    const formik = useFormik({
        initialValues: {
            months: 0,
            weeks: 0,
            days: 0,
        },
        enableReinitialize: true, // Ensures form values update when duration changes
        onSubmit: values => {
            console.log('Form values:', values);
            console.log('Selected course:', selectedCourse);
            console.log('Selected date:', date);
            console.log('Selected entries:', selected);
            console.log('Selected course object:', result);
          // You can handle form submission logic here
        },
    });

    const changeCourse = (courseId) => {
        setSelectedCourse(courseId)
        const selectedResult = result.find(r => r.course.id === courseId);
        if (selectedResult && selectedResult.course) {
            setCourse(selectedResult.course);

            // Update Formik duration values directly
            formik.setValues({
                months: selectedResult.months || 0,
                weeks: selectedResult.weeks || 0,
                days: selectedResult.days || 0,
            });
        }
        setDate({
            from: selected.filter(r => r.courseId === courseId)[0]?.start_date,
            to: selected.filter(r => r.courseId === courseId)[0]?.end_date,
        })
    }

    const handleDateChange = (CourseId) => (range) =>{


        // const formattedFrom = format(new Date(range?.from), 'yyyy-MM-dd');
        // const formattedTo = format(new Date(range?.to), 'yyyy-MM-dd');

        const formattedFrom = range?.from ? format(new Date(range.from), 'yyyy-MM-dd') + ' 00:00:00': null;
        const formattedTo = range?.to ? format(new Date(range.to), 'yyyy-MM-dd') + ' 23:59:59': null;

        setDate(range)

        // Update selected entries with new dates
        const updatedSelected = selected.map((entry) => {
            if (entry.courseId === CourseId) {
            return {
                ...entry,
                start_date: formattedFrom,
                end_date: formattedTo,
            };
            }
            return entry;
        });
        setSelected(updatedSelected);

        const totalDays = differenceInDays(new Date(range.to), new Date(range.from));

        const months = Math.floor(totalDays / 30);
        const weeks = Math.floor((totalDays % 30) / 7);
        const days = (totalDays % 30) % 7;


        const updated = result.map((entry) => {
            if (entry?.course.id === CourseId) {
                return {
                    ...entry,
                    months: months,
                    weeks: weeks,
                    days: days,
                };
            }
            return entry;
        });
        setResults(updated);

        formik.setValues({
            months: months || 0,
            weeks: weeks || 0,
            days: days || 0,
        });



    }

    //Front-end Pagnination (experimental)
    //result is the data
    const [currentPage, setCurrentPage] = useState(1);
    const itemPerpage = 5

    const indexFirstItem = (currentPage - 1) * itemPerpage;
    const indexLastItem = Math.min(indexFirstItem + itemPerpage, result.length);
    const currentPaginated = result.slice(indexFirstItem, indexLastItem)
    const totalPage = Math.ceil(result.length / itemPerpage)

    //Pagination Controll
    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum)
    }
    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPage));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    //Front-end Pagination for the Enrollees

    const enrolleePerPage = 5
    const [enrolleePage, setEnrolleePage] = useState(1);

    const selectedEnrollees = result.find(r => r.course.id === selectedCourse)
    const enrollees = selectedEnrollees?.enrollees

    const enrolleeFirstIndex = (enrolleePage - 1 ) * enrolleePerPage;
    const enrolleeLastIndex = Math.min(enrolleeFirstIndex + enrolleePerPage, enrollees?.length)
    const paginatedEnrollees = enrollees?.slice(enrolleeFirstIndex, enrolleeLastIndex)

    const enrolleeTotalPage = Math.ceil(enrollees?.length / enrolleePerPage)

    const EnrolleehandlePageChange = (pageNum) => {
        setEnrolleePage(pageNum)
    }

    const goToNextPageEnrollees = () => {
        setEnrolleePage((prev) => Math.min(prev + 1, enrolleeTotalPage));
    };

    const goToPreviousPageEnrollees = () => {
        setEnrolleePage((prev) => Math.max(prev - 1, 1));
    };

    useEffect(()=>{
        setEnrolleePage(1)
    },[selectedCourse])
    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50" />
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='w-[100vw] relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full w-full p-5 flex flex-col'>
                            {/* Header */}
                                <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 justify-between">
                                    <div>
                                        <h1 className="text-primary font-header text-3xl">Training Duration</h1>
                                        <p className="text-unactive font-text text-xs">Set a customized training period for learners, helping them manage their course timelines effectively.</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="h-fit bg-primarybg p-5 rounded-full flex items-center justify-center">
                                            <div className="h-full w-fit aspect-square flex items-center justify-center">
                                                <FontAwesomeIcon icon={faClock} className="text-primary text-lg"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/* Content */}
                                <div className="grid grid-rows-[min-content_1fr_min-content] grid-cols-4">
                                    <div className="flex flex-col justify-center pl-5 pr-4 border-r border-divider w-full">
                                        <p className="font-header text-2xl text-primary">Course to Enroll</p>
                                        {
                                            result.length < itemPerpage ? (
                                                <p className="text-unactive font-text text-xs">Show selected courses</p>
                                            ) : (
                                                <p className="text-unactive font-text text-xs">Showing <span className="text-primary font-header">{indexFirstItem + 1}</span> to <span className="text-primary font-header">{indexLastItem}</span> of total <span className="text-primary font-header">{result.length}</span> selected course/s</p>
                                            )
                                        }
                                    </div>
                                    {/* Course Duration */}
                                    <div className="col-span-2">
                                    <form>
                                        <div className="pl-4 pr-1 grid grid-cols-3 grid-rows-[min-content_auto] gap-2 py-2">
                                            <div  className="inline-flex flex-col gap-2 row-start-1 col-span-1">
                                                <p className="font-text text-unactive text-xs"> Course Duration:</p>
                                            </div>
                                            {/* Months */}
                                            <div className="inline-flex flex-col row-start-2">
                                            <input type="text" name="months"
                                                value={formik.values.months}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                readOnly
                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text text-unactive pb-2">Months</p>
                                                </label>
                                                {/* {formik2.touched.months && formik2.errors.months ? (<div className="text-red-500 text-xs font-text">{formik2.errors.months}</div>):null} */}
                                            </div>
                                            {/* Weeks */}
                                            <div className="inline-flex flex-col row-start-2">
                                            <input type="text" name="weeks"
                                                value={formik.values.weeks}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                readOnly
                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text text-unactive pb-2">Weeks</p>
                                                </label>
                                                {/* {formik2.touched.weeks && formik2.errors.weeks ? (<div className="text-red-500 text-xs font-text">{formik2.errors.weeks}</div>):null} */}
                                            </div>
                                            {/* Days */}
                                            <div className="inline-flex flex-col row-start-2">
                                            <input type="text" name="days"
                                                value={formik.values.days}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                readOnly
                                                className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                <label htmlFor="course_name" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text text-unactive">Days</p>
                                                </label>
                                                {/* {formik2.touched.days && formik2.errors.days ? (<div className="text-red-500 text-xs font-text">{formik2.errors.days}</div>):null} */}
                                            </div>
                                        </div>
                                    </form>
                                    </div>
                                    {/* Duration Selector */}
                                    <div className="pr-4 py-2 pl-1 grid gap-2 grid-rows-[min-content_min-content] w-full col-start-4 col-span-1">
                                    <p className="text-xs font-text text-unactive">Start Date and End Date</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex flex-row justify-between items-center font-text border border-divider rounded-md py-2 px-4 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary">
                                                <p>{
                                                    date?.from ? (
                                                        date?.to ? (
                                                            <>
                                                            {format(date.from, "LLL dd, y")} -{" "}
                                                            {format(date.to, "LLL dd, y")}
                                                            </>
                                                        ) : (format(date.from, "LLL dd, y"))
                                                    ) : ("Pick a Date")

                                                    }</p>
                                                <FontAwesomeIcon icon={faCalendar} className="text-primary text-lg"/>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={handleDateChange(selectedCourse)}
                                                disabled={{ before: new Date() }}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    </div>
                                    {/* Selected Courses */}
                                    <div className="col-start-1 row-start-2 row-span-2 border-r border-divider px-4 py-2 flex flex-col gap-2">
                                    {
                                        currentPaginated.map((course, index) => (
                                            <div key={course.id} className={`text-primary w-full p-3 grid grid-cols-[auto_3.75rem] border border-divider rounded-md font-text shadow-md hover:cursor-pointer hover:scale-105 transition-all ease-in-out ${selectedCourse === course.course.id ? "bg-primary !text-white": null} `} onClick={() => changeCourse(course.course.id)}>
                                                <div className="pb-2 flex justify-between w-full col-span-2">
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                                        {course.course.training_type}
                                                    </span>
                                                    <div className=" bg-[#1664C0] rounded-full text-white flex items-center justify-center aspect-square">
                                                        <p className="text-xs px-3">{course.enrollees?.length || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <h1 className="text-sm font-header">{course.course.name}</h1>
                                                    <p className="text-xs">{course.course.types[0].type_name} - {course.course.categories[0].category_name}</p>
                                                </div>
                                            </div>
                                        ))
                                        }
                                    </div>
                                    {/* Learner */}
                                    <div className="px-4 py-2 col-span-3 row-span-1">
                                        <p className="text-unactive font-text text-xs pb-2">Learners:</p>
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
                                                    paginatedEnrollees?.map((enrollee)=> (
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
                                    {/* Selected Course Pagination */}
                                    <div className="flex items-center justify-center px-4 border-r border-divider">
                                        {
                                            result.length < itemPerpage ? (null):(
                                                <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                                {/* Previous */}
                                                <a
                                                    onClick={goToPreviousPage}
                                                    className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronLeft}/>
                                                </a>

                                                {/* Current Page & Dynamic Paging */}
                                                {Array.from({ length: totalPage }, (_, i) => (
                                                    <a
                                                        key={i}
                                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                            ${
                                                                currentPage === i + 1
                                                                ? 'bg-primary text-white'
                                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                            } transition-all ease-in-out`}
                                                        onClick={() => handlePageChange(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </a>))}
                                                <a
                                                    onClick={goToNextPage}
                                                    className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronRight}/>
                                                </a>
                                                </nav>
                                            )
                                        }
                                    </div>
                                    {/* Selected Enrollees Pagination */}
                                    <div className="row-start-3 col-start-2 col-span-3 px-4 py-3 flex flex-row justify-between items-center">
                                        <p className="text-unactive font-text text-xs">Showing <span className="text-primary font-header">{enrolleeFirstIndex + 1}</span> to <span className="text-primary font-header">{enrolleeLastIndex}</span> of total <span className="text-primary font-header">{enrollees?.length}</span> selected enrollee/s</p>
                                        {

                                                <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                                {/* Previous */}
                                                <a
                                                    onClick={goToPreviousPageEnrollees}
                                                    className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronLeft}/>
                                                </a>
                                                {/* Current Page & Dynamic Paging */}
                                                {Array.from({ length: enrolleeTotalPage }, (_, i) => (
                                                    <a
                                                        key={i}
                                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                            ${
                                                                enrolleePage === i + 1
                                                                ? 'bg-primary text-white'
                                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                            } transition-all ease-in-out`}
                                                        onClick={() => EnrolleehandlePageChange(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </a>))}
                                                <a
                                                    onClick={goToNextPageEnrollees}
                                                    className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronRight}/>
                                                </a>
                                                </nav>

                                        }
                                    </div>

                                </div>
                            {/* Action Button */}
                                <div className="col-span-2 flex flex-row gap-2 px-4 pt-4">
                                <button
                                    onClick={close}
                                    className={`bg-white border-2 border-primary p-4 rounded-md font-header uppercase text-primary text-xs hover:cursor-pointer hover:bg-primaryhover hover:scale-105 hover:text-white hover:border-primaryhover transition-all ease-in-out w-full
                                    `}>
                                    Cancel</button>
                                <button
                                    onClick={handleEnrollment}
                                    type="submit"
                                    disabled={enrolling}
                                    className={`bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer ${enrolling ? "" : "hover:bg-primaryhover hover:scale-105"}  transition-all ease-in-out w-full
                                    `}>
                                    {enrolling ? "Enrolling" : "Set Duration"}</button>
                                </div>


                            </div>
                        </DialogPanel>

                    </div>

                </div>

        </Dialog>
    )
}

export default BulkEnrollmentCourseDuration;
