import { faBook, faBookBookmark, faCalendar, faChalkboardUser, faChevronLeft, faChevronRight, faFilter, faGraduationCap, faMagnifyingGlass, faSearch, faSpinner, faSwatchbook, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Helmet } from "react-helmet"
import axiosClient from "../axios-client"
import { act, useEffect, useMemo, useRef, useState } from "react"
import Learner from "../modalsandprops/LearnerEnroleeEntryProps"
import EnrollmentTableProps from "../modalsandprops/EnrollmentTableProps"
import AssignedCourseEnrollmentCard from "../modalsandprops/AssignedCourseEnrollmentCard"
import LearnerLoadingProps from "../modalsandprops/LearnerLoadingProps"
import { useStateContext } from "../contexts/ContextProvider"
import CourseLoading from "../assets/Course_Loading.svg";
import { useFormik } from "formik"
import React from "react"
import EnrolledSuccessfullyModal from "../modalsandprops/EnrollmentSuccessfulyModal"
import EnrollmentFailedModal from "../modalsandprops/EnrollmentFailedModal"
import NoEmployeeSelectedModal from "../modalsandprops/NoEmployeeSelectedModal"
import { add, differenceInDays, format, formatDate, set } from "date-fns"
import { ScrollArea } from "../components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"
import BulkEnrollmentCourseDuration from "../modalsandprops/BulkEnrollmentCourseDuration"
import { use } from "react"
import BulkEnrollmentCourseSelectorModal from "../modalsandprops/BulkEnrollmentCourseSelectorModal"
import { createPortal } from "react-dom"
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { useBlocker } from "react-router-dom";
import Unerollnment from "../modalsandprops/Unenrollment"
import ReviewEnrollment from "../modalsandprops/ReviewEnrollment"
import { useOption } from "../contexts/AddUserOptionProvider"



function UseElementPos (ref,enabled=true, offset=8){
    const [coords, setCoords] = useState(null);
    const [breakpoint, setBreakpoint] = useState(null);

    useEffect(()=>{
        const getBreakpoint = () => {
            const width = window.innerWidth;
            if (width >= 1280) return "lg";
            if (width >= 1024) return "md";
            if (width >= 768) return "sm";
            return "xs";
        }


        const toolTip = () => {
            const run = () => {
                const rect = ref.current.getBoundingClientRect();
                const currentBreakpoint = getBreakpoint();
                setCoords({
                    top: rect.bottom + offset,
                    left: ["md", "sm", "xs"].includes(currentBreakpoint)
                        ? rect.left
                        : rect.left + rect.width / 2,
                });
            }

            requestAnimationFrame(()=>{
                run();
                requestAnimationFrame(run)
            });
        }

        toolTip();
        const resizeObserver = new ResizeObserver(toolTip);
        resizeObserver.observe(ref.current);

        window.addEventListener('resize', toolTip)
        window.addEventListener('scroll', toolTip, true);

        return () => {
            window.removeEventListener('scroll', toolTip, true);
            window.removeEventListener('resize', toolTip)
            resizeObserver.disconnect();
        }
    },[ref, enabled, offset])

    return coords;
}

export default function BulkEnrollment() {
    const {departments,cities,location, division, section} = useOption();
    const {user} = useStateContext();
    const [assigned_courses, setAssigned_courses] = useState([]);

    const [learners, setLearners] = useState([]); //List all learners

    const [enrollment,setEnrollment] = useState([]); //Enrolled Learners
    const [course, setCourse] = useState({}); //Select course

    const [courseId, setCourseId] = useState([]); //Select course to enroll id

    const [isLoading, setLoading] = useState(true); //Loading state
    const [learnerLoading, setLearnerLoading] = useState(true); //Loading state
    const [courseListLoading, setCourseListLoading] = useState(true); //Loading state for course list
    const [learnerFiltering, setLearnerFiltering] = useState(false)
    const [learnerFiltered, setLearnerFiltered] = useState(false)
    const [openLearnerFilter, setOpenLearnerFilter] = useState(false)

    const selectAll = useRef(null) //select all learners
    const [all, setAll] = useState(false); //Selected Learners
    const [selectAllmap, setSelectAllmap] = useState([]);

    const [enrolled, setEnrolled] = useState(false) //Modal for successfully Enrolled

    const [error, setError] = useState([]) //Error state
    const [enrollmentFailed, setEnrollmentFailed] = useState(false) //Enrollment failed state

    const [enrolling, setEnrolling] = useState(false) //Enrolling state

    const [openDuration, setOpenDuration] = useState(false)
    const [openSelector, setOpenSelector] = useState(false);
    const [openReview, setOpenReview] = useState(false);

    const buttonRef = useRef();
    const dateButton = useRef();

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const blocker = useBlocker(hasUnsavedChanges);


    const [popOverState, setPopOverState] = useState({
        numberOfMonths: 2,
        side: "bottom",
        sideOffset: 8,
    })

    useEffect(() => {
        setEnrollment([]);

        const getBreakPoint = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setPopOverState({
                    numberOfMonths: 2,
                    side: "bottom",
                    sideOffset: 8,
                })
                return "md";
            }else {
                setPopOverState({
                    numberOfMonths: 1,
                    side: "left",
                    sideOffset: 8,
                })
            }
            return "xs";
        }

        window.addEventListener('resize', getBreakPoint);
        getBreakPoint();
        return () => window.removeEventListener('resize', getBreakPoint);
    },[])




    //Dates
    const getEndDate = () => {
        if (!course?.id) return null
        const end = add(new Date(), {
        months: course.months || 0,
        weeks: course.weeks || 0,
        days: course.days || 0,})
        return end;
    }
    const DateFormik = useFormik({
        enableReinitialize: true,
            initialValues:  {
                start_date:  assigned_courses.length === 0 ? "Select date" : format(new Date(), "MMMM dd yyyy") || "Select date",
                end_date: getEndDate() ? format(getEndDate(), "MMMM dd yyyy") : "Select date",
                months: course?.months || 0,
                weeks: course?.weeks || 0,
                days: course?.days || 0,
            },
    })
    const [date, setDate] = useState({
        from: new Date(),
        to: undefined,
    });
    const handleDateChange = (course) => (range) => {
        const start = range.from
        const end = range.to

        DateFormik.setFieldValue("start_date", start ? format(start, "MMMM dd yyyy") : "Select start date")
        DateFormik.setFieldValue("end_date", end ? format(end, "MMMM dd yyyy") : "Select end date")
        setDate(range)

        const totalDuration = differenceInDays(new Date(end), new Date(start)) + 1;
        const months = Math.floor(totalDuration / 30);
        const weeks = Math.floor((totalDuration % 30) / 7);
        const days = (totalDuration % 30) % 7;

        DateFormik.setFieldValue("months", months);
        DateFormik.setFieldValue("weeks", weeks);
        DateFormik.setFieldValue("days", days);

        setEnrollment((prev) => {
            const courseObject = [...prev]

            const selectedCourse = courseObject.find((c) => c.course.id === course);
            if(selectedCourse){
                selectedCourse.duration.months = months;
                selectedCourse.duration.weeks = weeks;
                selectedCourse.duration.days = days;

                selectedCourse.start_date = start ? format(start, 'yyyy-MM-dd') + ' 00:00:00' : "";
                selectedCourse.end_date = end ? format(end, 'yyyy-MM-dd') + ' 23:59:59' : "";
            }

            return courseObject;
        })
    }

    //Learner Pagenation States
    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage:10,
        totalUser: 0,
        lastPage: 1,
        startNumber: 0,
        endNumber: 0,
        currentPerPage:0,
        currentFrontendPage: 1,
    })
    //Learner Pagination Change State
    const pageChangeState = (key, value) => {
        setPagination((prev) => ({
            ...prev,
            [key]: value
        }))
    }
    //Course Pagenation States
    const [coursePageState, setCoursePagination] = useState({
        currentPage: 1,
        perPage:6,
        totalCourse: 0,
        lastPage: 1,
        startNumber: 0,
        endNumber: 0,
    })
    // Course Pagination Change State
    const coursePageChangeState = (key, value) => {
        setCoursePagination((prev) => ({
            ...prev,
            [key]: value
        }))
    }
    // Start and End entry Course Pagination
    useEffect(() => {
            coursePageChangeState('startNumber', (coursePageState.currentPage - 1) * coursePageState.perPage + 1)
            coursePageChangeState('endNumber', Math.min(coursePageState.currentPage * coursePageState.perPage, coursePageState.totalCourse))
        },[coursePageState.currentPage, coursePageState.perPage, coursePageState.totalCourse])


    // handle frontend pagination
    const [bufferedUserList, setBufferedUserList] = useState([])
    const [currentChunk, setCurrentChunk] = useState(1);
    const entry_per_chunk = 5;

    const LearnerPaginated = useMemo(()=>{
        const startIndex = (currentChunk - 1) * entry_per_chunk;
        return bufferedUserList.slice(startIndex, startIndex + entry_per_chunk);
    }, [bufferedUserList, currentChunk])
    useEffect(() => {
        const frontEndPagination = (pageState.currentPage - 1) * 2 + currentChunk;

        pageChangeState("startNumber", (frontEndPagination - 1)*entry_per_chunk + 1)
        pageChangeState("endNumber", Math.min(frontEndPagination * entry_per_chunk, pageState.totalUser))

        // pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
        // pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalUser))
    },[pageState.currentPage, currentChunk, bufferedUserList])

    // Dynamic Page Number
    const Pages = [];
    const totalFrontendPages = Math.ceil(pageState.totalUser / entry_per_chunk);
    for(let p = 1; p <= totalFrontendPages; p++){
        Pages.push(p)
    }

    //Next and Previous Page
    const back = () => {
        if(isLoading || learnerLoading || pageState.currentFrontendPage === 1) return;

        if(currentChunk > 1) {
            setCurrentChunk(prev => prev-1);
        } else if (pageState.currentPage > 1) {
                pageChangeState("currentPage", pageState.currentPage - 1)
                setCurrentChunk(2);
            }
        pageChangeState("currentFrontendPage", pageState.currentFrontendPage - 1)

        // if (pageState.currentPage > 1){
        //     pageChangeState("currentPage", pageState.currentPage - 1)
        //     pageChangeState("startNumber", pageState.perPage - 4)
        // }
    }
    const next = () => {
        const totalFrontendPages = Math.ceil(pageState.totalUser / entry_per_chunk);
        if(isLoading || learnerLoading || totalFrontendPages === pageState.currentFrontendPage) return;

        if(currentChunk < 2) {
            setCurrentChunk(prev => prev+1);
        } else {
            if (pageState.currentPage === pageState.lastPage) return;
            pageChangeState("currentPage", pageState.currentPage + 1)
            setCurrentChunk(1);
        };
        pageChangeState("currentFrontendPage", pageState.currentFrontendPage + 1)
        // if (pageState.currentPage < pageState.lastPage){
        //     pageChangeState("currentPage", pageState.currentPage + 1)

        // }
    }
    const pageChange = (page) => {
        if(isLoading) return;

        const chunkCount = pageState.perPage / entry_per_chunk;

        const serverPage = Math.ceil(page / chunkCount);
        const currentChunkPage = ((page-1) % chunkCount) + 1

        pageChangeState("currentPage", serverPage)
        setCurrentChunk(currentChunkPage);
        pageChangeState("currentFrontendPage", page)
        // if(page > 0 && page <= pageState.lastPage){
        //     pageChangeState("currentPage", page)
        // }
    }



    //Handle Learner to be enroll
    const fetchLearner = (courseId) => {
        setLearnerLoading(true)
        axiosClient.get(`/index-user-enrollments/${courseId}`,{
            params: {
                        page: pageState.currentPage,
                        perPage: pageState.perPage
                    }
        }
        ).then(({data})=>{
            // setLearners(data.data)
            pageChangeState('totalUser', data.total)
            pageChangeState('lastPage', data.lastPage)

            setBufferedUserList(data.data)
            setLearnerLoading(false)
        }).catch((err)=>{
            console.log(err)
        })
    }
    const handleLearnerChange = (courseId) => {
        if(!courseId){
            setBufferedUserList([]);
            setLearnerLoading(false);
            return
        }
        fetchLearner(courseId);
    }
    const handleLearnerFilter = () => {
        setLearnerFiltering(true)
        console.log("Filtering Learner for course:", course.id, "with values:", LearnerFormik.values)
        //Fetch Learner
        //fetchLearner(courseId);
        setTimeout(()=>{
            setOpenLearnerFilter(false)
            setLearnerFiltering(false)
            setLearnerFiltered(true);
        },2000)
    }

    //Learner to enroll
    const handleCheckbox = (User, course) => {
        setHasUnsavedChanges(true);
        setEnrollment((entry)=> {
            if(!User&&!course) return prevCourses;

            const currentEnrollment = [...entry];

            const existingCourse = currentEnrollment.findIndex((i)=>(i.course.id === course.id));

            if(existingCourse === -1){
                currentEnrollment.push({
                    course: course,
                    enrollees: [User],
                    duration: {
                        months: course?.months || 0,
                        weeks: course?.weeks || 0,
                        days: course?.days || 0,
                    },
                    start_date: format(date.from, 'yyyy-MM-dd') + ' 00:00:00',
                    end_date: format(date.to, 'yyyy-MM-dd') + ' 23:59:59',
                })
            }else{
                const currentCourse = {...currentEnrollment[existingCourse]};
                const enrolled = currentCourse.enrollees.some((entry) => (entry.id === User.id));

                if(enrolled){
                    const selectAll = selectAllmap.find((e) => e.courseId === course.id);
                    if(selectAll){
                        setSelectAllmap((prev) => prev.filter((e) => e.courseId !== course.id));
                    }
                    currentCourse.enrollees = currentCourse.enrollees.filter((entry) => entry.id !== User.id);
                }else{
                    currentCourse.enrollees.push(User);
                }

                if(currentCourse.enrollees.length === 0){
                    currentEnrollment.splice(existingCourse, 1);
                }else {
                    currentEnrollment[existingCourse] = currentCourse;
                }

            }
            return currentEnrollment;
        })
    }

    //Select All Learners
    const selectAllLearner = () => {
        if(!course.id) return;

        const current = enrollment.find((entry) => entry.course.id === course.id);
        const exist = selectAllmap.find((e) => e.courseId === course.id);

        if(!exist){
            console.log("Select All Learner:", course.id)
            LearnerPaginated.forEach((learner) => {
                if(!current || !current.enrollees.some((enrollee) => enrollee.id === learner.id)) {
                    handleCheckbox(learner, course);
                }
            })

            selectAll.current.indeterminate = false;
            selectAll.current.checked = true
        } else {
            console.log("unSelect All Learner:", course.id)
            enrollment.find((entry) => entry.course.id === course.id)?.enrollees.forEach((learner) => {
                handleCheckbox(learner, course);
            })
            setAll(false);
        }

        setSelectAllmap((entry) => {
            const objects = [...entry]

            const exist = objects.find((e) => e.courseId === course.id);

            if(exist){
                console.log("Select All Learner:", course.id)
                return objects.filter((e) => e.courseId !== course.id);
            } else {
                return [...objects, {courseId: course.id}];
            }

        })

    }
    useEffect(()=>{
        if(!course) return;
        const exist = selectAllmap.find((e) => e.courseId === course.id);
        const current = enrollment.find((entry) => entry.course.id === course.id);

        if(exist){
            LearnerPaginated.forEach((learner) => {
                if(!current || !current.enrollees.some((enrollee) => enrollee.id === learner.id)) {
                    handleCheckbox(learner, course);
                }
            })

        }
    },[pageState.currentFrontendPage,LearnerPaginated])
    useEffect(() => {
        if(!course || !selectAll.current) return;
        const currentCourse = enrollment.find(entry => entry.course.id === course.id);
        const exist = selectAllmap.find((e) => e.courseId === course.id);

        if(enrollment.length === 0) {
            selectAll.current.indeterminate = false;
            selectAll.current.checked = false;
            return;
        } else if(exist) {
            selectAll.current.indeterminate = false;
            selectAll.current.checked = true;
        } else if(!currentCourse) {
            selectAll.current.indeterminate = false;
            selectAll.current.checked = false;
        }
        else {
            selectAll.current.indeterminate = true;
            selectAll.current.checked = false;
        }

    }, [enrollment,course]);

    //Number of enrollees
    const numberOfEnrollees = (course) => {
        const current = enrollment.find((entry) => entry.course.id === course?.id);
        return current ? current.enrollees.length : 0;
    };



    //Formik for filter
    const formik = useFormik({
        initialValues : {
            filter: "myCourses"
        }
    });
    const LearnerFormik = useFormik({
        initialValues: {
            division: '',
            department: '',
            section: '',
            branch: '',
            city:'',
        },
        onSubmit: values => {
            console.log("Filtering the following, ", values)
        }
    })
    const [selectedBranches, setSelectedBranches] = useState([])
    const handleBranchesOptions = (e) =>{
        const city = e.target.value;
        LearnerFormik.setFieldValue('city', city)
        LearnerFormik.setFieldValue('branch', '')

        //Filtering
        const filteredBranches = location.filter((branch) => branch.city_id.toString() === city)
        setSelectedBranches(filteredBranches)
    }


    //Fetch Courses
    useEffect(() => {
        setCourseListLoading(true);
        if(formik.values.filter === "myCourses"){
            axiosClient.get(`/select-user-added-courses/${user.user_infos?.id}`,{
                params: {
                    page: coursePageState.currentPage,
                    perPage: coursePageState.perPage,
                }
            })
            .then(({data}) => {
                setAssigned_courses(data.data)
                setCourse(data.data[0])
                coursePageChangeState("totalCourse", data.total)
                coursePageChangeState("lastPage", data.lastPage)
                setCourseListLoading(false);
                setLoading(false)
            })
            .catch((err) => {
                console.log(err);
            })
        } else if(formik.values.filter ==="Assigned"){
            axiosClient.get(`/select-user-assigned-courses/${user.user_infos?.id}`,{
                    params: {
                        page: coursePageState.currentPage,
                        per_page: coursePageState.perPage,
                    }
                })
                .then(({ data }) => {
                    setAssigned_courses(data.data)
                    setCourse(data.data[0])
                    coursePageChangeState("totalCourse", data.total)
                    coursePageChangeState("lastPage", data.lastPage)
                    setCourseListLoading(false);
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    },[formik.values.filter])
    useEffect(() => {
        handleLearnerChange(course?.id)
        setDate((prev) => ({...prev, to: getEndDate()}))
    },[course, pageState.currentPage])



    //Handle Enrollment Submisstion
    const handleEnrollment = () => {
        if(enrolling) return;
        setEnrolling(true)
        const payload = enrollment.flatMap((obj) =>
            obj.enrollees.map((enrollee) => (
                {
                    userId: enrollee.id,
                    courseId: obj.course.id,
                    enrollerId: user.user_infos.id,
                    start_date: obj.start_date,
                    end_date: obj.end_date,
                }
            ))
        )
        console.log("Payload:", payload)
        setHasUnsavedChanges(false);
        setTimeout(() => {
            setEnrolling(false)
        },2000)
        setTimeout(() => {
            setOpenReview(false);
            setEnrolled(true);
            if(blocker.state === 'blocked') {
                blocker.reset();
            }
        },2100)
        // setProccess(true)
        // axiosClient.post('enrollments/bulk', selected)
        // .then(({data}) => {
        //     setEnrolled(true);
        //     setOpenDuration(false)
        //     setEnrolling(false)
        //     setProccess(false)
        // }).catch((err)=>{
        //     console.log(err)
        // })
    }
    // useEffect(() => {
    //     //console.log("Course:", course)
    //     console.log("Enrollment:", enrollment)
    //     console.log("selectAllmap:", selectAllmap)
    //     //console.log(hasUnsavedChanges)
    // },[enrollment,selectAllmap])


    const selectCourseToolTip = UseElementPos(buttonRef, openSelector, 8);
    const dateToolTip = UseElementPos(dateButton, openDuration, 8);

    return (
        <>
        <div className='grid grid-cols-4 h-full w-full
                        grid-rows-[6.25rem_min-content_min-content_min-content_min-content_1fr_min-content]
                        md:grid-rows-[6.25rem_min-content_min-content_min-content_1fr_min-content]
                        lg:grid-rows-[6.25rem_min-content_min-content_auto_min-content]'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Enroll Trainee</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center row-span-1 border-b border-divider
                            col-start-1 row-start-1 col-span-3 ml-3
                            xl:col-span-3
                            sm:col-span-3 sm:ml-4'>
                <h1 className='text-primary font-header
                                text-xl
                                sm:text-2xl
                                xl:text-4xl'>Enroll Learner</h1>
                <p className='font-text text-unactive
                                text-xs
                                xl:text-sm
                                sm:text-xs'>Quickly enroll large groups of trainees into assigned courses for efficient training delivery.</p>
            </div>

            {/* Enroll button */}
            <div className="row-start-1 flex flex-col justify-center border-divider border-b
                            items-end mr-3
                            xl:col-start-4 xl:pl-5 xl:mr-5
                            sm:col-span-1 sm:col-start-4 sm:py-2 sm:mr-4">
                <div className='relative group sm:w-full'>
                    <button className={`inline-flex flex-row shadow-md items-center justify-center bg-primary font-header text-white text-base p-4 rounded-full  transition-all ease-in-out
                                    w-16 h-16
                                    sm:w-full
                                    ${enrollment.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover"}`}
                        onClick={()=>{
                            if(enrollment.length === 0) return
                            setOpenReview(true);
                        }}>
                        <FontAwesomeIcon icon={faUserPlus} className='sm:mr-2'/>
                        <p className='hidden
                                    sm:block'>Enroll</p>
                    </button>
                    <div className='absolute bottom-[-2.5rem] w-full bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap scale-0 group-hover:scale-100 block transition-all ease-in-out
                                    sm:hidden'>
                        <p>Enroll</p>
                    </div>
                </div>
            </div>

            {/* Course */}
            <div className="row-start-2 col-span-4 flex flex-col gap-2 pl-3 pt-2
                            md:pr-2 lg:col-span-2 lg:pl-4 lg:py-2">
                <p className=" font-text text-xs">Selected Course:</p>
                <div className="flex flex-row gap-2">
                    <div className="group relative">
                        <div className={`w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md transition-all ease-in-out ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primary hover:text-white hover:scale-105"}`}
                            onClick={() => {
                                if(isLoading) return;
                                setOpenSelector(true);
                            }}
                            ref={buttonRef}>
                            <FontAwesomeIcon icon={faBookBookmark}/>
                        </div>
                        <div
                            style={{
                                top: `${selectCourseToolTip?.top}px`,
                                left: `${selectCourseToolTip?.left}px`,
                            }}
                        className={`fixed scale-0 group-hover:scale-100 bg-tertiary text-white font-text p-2 text-xs rounded-md shadow-lg whitespace-nowrap z-50 transition-all ease-in-out ${isLoading ? "group-hover:scale-0" : " group-hover:scale-100"} xl:-translate-x-1/2`}>
                            <p>Select Course</p>
                        </div>
                    </div>
                    <div className={`${isLoading ? "flex-row items-center justify-between":"flex-col"} flex `}>
                        {
                            isLoading ?
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="text-primary mr-2 animate-spin"/>
                                <p className="font-header text-base text-primary">Loading...</p>
                            </>
                            :<>
                                <p className="text-primary font-header text-sm lg:text-base">{course?.name || "No Selected Course"}</p>
                                <p className="text-unactive font-text text-xs">{course && (<>Course ID: {course.CourseID}</>)}</p>
                            </>
                        }
                    </div>
                </div>
            </div>
            <form className="py-2 grid grid-cols-[min-content_1fr_1fr_1fr] grid-rows-[min-content_auto] gap-2 col-span-4 px-3
                            lg:row-start-2 lg:col-span-2 lg:col-start-3 lg:mr-5 lg:px-0">
                    <div className="col-start-1 row-start-2 flex flex-row items-center gap-2 justify-end">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="group relative" disabled={isLoading || assigned_courses.length === 0}>
                                    <div ref={dateButton} className={`w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center bg-white shadow-md transition-all ease-in-out ${isLoading || assigned_courses.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primary hover:text-white hover:scale-105"}`}>
                                        <FontAwesomeIcon icon={faCalendar}/>
                                    </div>
                                    <div
                                        style={{
                                            top: `${dateToolTip?.top}px`,
                                            left: `${dateToolTip?.left}px`,
                                        }}
                                        className={`fixed scale-0 group-hover:scale-100 bg-tertiary text-white font-text p-2 text-xs rounded-md shadow-lg whitespace-nowrap z-50 transition-all ease-in-out ${isLoading ? "group-hover:scale-0" : " group-hover:scale-100"} xl:-translate-x-1/2`}>
                                        <p>Date Adjustment</p>
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-2" side={popOverState.side} sideOffset={popOverState.sideOffset}>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    numberOfMonths={popOverState.numberOfMonths}
                                    defaultMonth={date.from}
                                    selected={date}
                                    disabled={{ before: new Date() }}
                                    onSelect={handleDateChange(course?.id)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Course Duration */}
                    <div className="col-start-2 row-start-1 flex flex-col lg:items-end">
                        <p className="font-text text-xs">Course Duration:</p>
                    </div>
                    <div className="col-start-2 row-start-2 flex flex-col justify-center">
                        {
                            isLoading ?
                            <div className="flex flex-row items-center gap-2">
                                <FontAwesomeIcon icon={faSpinner} className="text-primary mr-2 animate-spin"/>
                                <p className="font-header text-base text-primary">Loading...</p>
                            </div>
                            : assigned_courses.length === 0 ?
                            <p className="font-header text-base text-primary">No Course Selected</p>
                            : <>
                                <p className="font-header text-header text-primary md:block hidden">{DateFormik.values.months || 0} <span className="text-xs font-text text-unactive">Month/s,</span> {DateFormik.values.weeks || 0} <span className="text-xs font-text text-unactive">Week/s,</span> {DateFormik.values.days || 0} <span className="text-xs font-text text-unactive">Day/s</span></p>
                                <p className="font-header text-header text-primary text-lg md:hidden">{DateFormik.values.months || 0}<span className="text-xs font-text text-unactive">mos,</span> {DateFormik.values.weeks || 0}<span className="text-xs font-text text-unactive">wks,</span> {DateFormik.values.days || 0}<span className="text-xs font-text text-unactive">d</span></p>
                            </>

                        }
                    </div>

                    {/* Start */}
                    <div className="col-start-3 row-start-1 flex flex-col lg:items-end">
                        <p className="font-text text-xs">Starting Date:</p>
                    </div>
                    <div className="col-start-3 row-start-2">
                        <input type="text" name="start_date"
                            readOnly
                            value={DateFormik.values.start_date}
                            onChange={DateFormik.handleChange}
                            disabled={isLoading || assigned_courses.length === 0}
                            // onBlur={(e) => {
                            //     courseFormik.handleBlur(e);
                            //     normalizationDuration({
                            //         ...courseFormik.values,
                            //         months: e.target.value,
                            //     }, courseFormik.setFieldValue);
                            // }}
                            className={`font-text border border-divider rounded-md p-2 w-full ${isLoading ? "opacity-50 cursor-not-allowed focus-within:outline-none":"focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"}`}/>
                            {/* {courseFormik.touched.months && courseFormik.errors.months ? (<div className="text-red-500 text-xs font-text">{courseFormik.errors.months}</div>):null} */}
                    </div>

                    {/* End */}
                    <div className="col-start-4 row-start-1 flex flex-col lg:items-end">
                        <p className="font-text text-xs">Ending Date:</p>
                    </div>
                    <div className="col-start-4 row-start-2">
                        <input type="text" name="end_date"
                            readOnly
                            disabled={isLoading || assigned_courses.length === 0}
                            value={DateFormik.values.end_date}
                            onChange={DateFormik.handleChange}
                            // onBlur={(e) => {
                            //     courseFormik.handleBlur(e);
                            //     normalizationDuration({
                            //         ...courseFormik.values,
                            //         months: e.target.value,
                            //     }, courseFormik.setFieldValue);
                            // }}
                            className={`font-text border border-divider rounded-md p-2  w-full ${isLoading ? "opacity-50 cursor-not-allowed focus-within:outline-none":"focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"}`}/>
                            {/* {courseFormik.touched.months && courseFormik.errors.months ? (<div className="text-red-500 text-xs font-text">{courseFormik.errors.months}</div>):null} */}
                    </div>
            </form>

            {/* Search */}
            <div className='col-span-2 pl-3 py-2
                            lg:row-start-3 lg:col-span-1'>
                {/* {
                    //search
                    true ? (
                        <div className='border-primary border-2 rounded-md shadow-md bg-white flex items-center justify-center text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out w-11 h-11'
                        onClick={()=>{setSearch(false), searchFormik.resetForm(), fetchUsers()}}>
                            <FontAwesomeIcon icon={faXmark}/>
                        </div>
                    ) : null
                } */}
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
            {/* Filter */}
            <div className="col-start-4 py-2 flex flex-row items-center justify-end pr-4
                            md:justify-start md:pl-2 md:col-start-3
                            lg:row-start-3 lg:col-start-2 ">
                <Sheet open={openLearnerFilter} onOpenChange={setOpenLearnerFilter}>
                    <SheetTrigger>
                        <div className="border-2 border-primary w-10 h-10 rounded-md bg-white shadow-md flex items-center justify-center text-primary gap-2 hover:cursor-pointer hover:border-primaryhover hover:bg-primaryhover hover:text-white transition-all ease-in-out
                                        md:px-4">
                            <FontAwesomeIcon icon={faFilter} className="text-lg"/>
                        </div>
                    </SheetTrigger>
                    <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                    <SheetContent>
                        <SheetTitle className={"font-header text-primary"}>Learner Flter</SheetTitle>
                        <SheetDescription className={"font-text text-xs"}>Filter learner you want to enroll in the selected course</SheetDescription>
                        <form onSubmit={LearnerFormik.handleSubmit} className="py-2 flex-col flex gap-3">
                            <div className="inline-flex flex-col gap-1">
                                    <label htmlFor="division" className="font-header text-xs flex flex-row justify-between">
                                        <p className="text-xs font-text text-unactive">Division </p>
                                    </label>
                                    <div className="grid grid-cols-1">
                                        <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                            value={LearnerFormik.values.division}
                                            onChange={LearnerFormik.handleChange}
                                            onBlur={LearnerFormik.handleBlur}
                                            >
                                            <option value=''>Select Division</option>
                                            {
                                                division.map((division) => (
                                                    <option key={division.id} value={division.id}>{division.division_name}</option>
                                                ))
                                            }
                                        </select>
                                        <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                        <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                            </div>
                            <div className="inline-flex flex-col gap-1">
                                <label htmlFor="department" className="font-header text-xs flex flex-row justify-between">
                                    <p className="text-xs font-text text-unactive">Department </p>
                                </label>
                                <div className="grid grid-cols-1">
                                    <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                        value={LearnerFormik.values.department}
                                        onChange={LearnerFormik.handleChange}
                                        onBlur={LearnerFormik.handleBlur}
                                        >
                                        <option value=''>Select Department</option>
                                        {
                                            departments.map((department) => (
                                                <option key={department.id} value={department.id}>{department.department_name}</option>
                                            ))
                                        }
                                    </select>
                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="inline-flex flex-col gap-1">
                                <label htmlFor="section" className="font-header text-xs flex flex-row justify-between">
                                    <p className="text-xs font-text text-unactive">Section</p>
                                </label>
                                <div className="grid grid-cols-1">
                                    <select id="section" name="section" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                        value={LearnerFormik.values.section}
                                        onChange={LearnerFormik.handleChange}
                                        onBlur={LearnerFormik.handleBlur}
                                        >
                                        <option value=''>Select Section</option>
                                        {
                                            section.map((section) => (
                                                <option key={section.id} value={section.id}>{section.section_name}</option>
                                            ))
                                        }
                                    </select>
                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="inline-flex flex-col gap-1">
                                <label htmlFor="city" className="font-header text-xs flex flex-row justify-between">
                                    <p className="text-xs font-text text-unactive">City</p>
                                </label>
                                <div className="grid grid-cols-1">
                                    <select id="city" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                        value={LearnerFormik.values.city}
                                        onChange={handleBranchesOptions}
                                        onBlur={LearnerFormik.handleBlur}
                                        >
                                        <option value=''>Select Branch City</option>
                                        {
                                            cities.map((city) => (
                                                <option key={city.id} value={city.id}>{city.city_name}</option>
                                            ))
                                        }
                                    </select>
                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="inline-flex flex-col gap-1">
                                <label htmlFor="branch" className="font-header text-xs flex flex-row justify-between">
                                    <p className="text-xs font-text text-unactive">Location</p>
                                </label>
                                <div className="grid grid-cols-1">
                                    <select id="branch" name="branch" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                        value={LearnerFormik.values.branch}
                                        onChange={LearnerFormik.handleChange}
                                        onBlur={LearnerFormik.handleBlur}
                                        >
                                        <option value=''>Select Branch Location</option>
                                        {selectedBranches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                        ))}
                                    </select>
                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </form>
                        <div className="flex flex-row gap-2 py-2">
                            <div className={`w-full p-3 flex flex-row justify-center gap-2 items-center bg-primary text-white rounded-md shadow-md ease-in-out transition-all ${learnerFiltering ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover"}`}
                                onClick={()=>{
                                    if(learnerFiltering) return;
                                    handleLearnerFilter()}}>
                                {
                                    learnerFiltering ? <>
                                        <FontAwesomeIcon icon={faSpinner} className="text-white mr-2 animate-spin"/>
                                        <p className="font-header">Filtering...</p>
                                    </>
                                    :
                                    <>
                                    <FontAwesomeIcon icon={faFilter}/>
                                    <p className="font-header">Filter</p>
                                    </>
                                }
                            </div>
                            {/* reset */}
                            {
                                learnerFiltered ?
                                <div className=" flex items-center justify-center bg-white border-2 border-primary rounded-md min-h-12 min-w-12 h-12 w-12 shadow-md text-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out"
                                    onClick={()=>{
                                        setLearnerFiltered(false);
                                    }}>
                                    <FontAwesomeIcon icon={faXmark} className="text-2xl"/>
                                </div>
                                : null
                            }
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Number of enrollees */}
            <div className="flex  items-end gap-2 col-span-4 px-3 justify-between py-2
                            md:col-span-1 md:flex-col md:py-2 md:justify-normal
                            lg:col-start-4 lg:pr-5 lg:px-0 lg:flex-col">
                <p className="text-xs font-text">Number of Enrollees:</p>
                <p className="text-primary font-header text-sm"> {numberOfEnrollees(course)}<span className="font-text text-xs text-unactive"> Enrollees</span></p>
            </div>
            {/* Table */}
            <div className="py-2 col-span-4 px-3">
                <EnrollmentTableProps selectAll={selectAll} all={()=>{selectAllLearner()}}>
                    {

                        learnerLoading || isLoading ? (
                            <LearnerLoadingProps/>
                        )  :  assigned_courses.length === 0 || !course?(
                            <tr className={`font-text text-sm text-primary hover:bg-gray-200 cursor-pointer`}>
                                <td colSpan={5} className="text-center text-primary py-4">No Selected Course</td>
                            </tr>
                        ):
                        LearnerPaginated.map((learner)=>(
                            <Learner key={learner?.id} learner={learner} handleCheckbox={()=>{handleCheckbox(learner, course)}} currentCourse={course} enrollmentList={enrollment}/>
                        ))
                    }
                </EnrollmentTableProps>
            </div>

            {/* Pagination */}
            <div className="py-4 px-4 col-span-4 flex flex-row justify-between items-center">
                {
                    assigned_courses.length === 0 ? (
                        <div>
                            <p className='text-sm font-text text-unactive'>No Course Selected</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className='text-sm font-text text-unactive'>
                                    {
                                        isLoading || learnerLoading ?
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin"/> Retrieving Learners...
                                        </>:
                                        <>
                                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUser}</span> <span className='text-primary'>results</span>
                                        </>
                                    }
                                </p>
                            </div>
                            <div>
                            <nav className={`isolate inline-flex -space-x-px round-md shadow-xs ${isLoading || learnerLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                {/* Previous */}
                                <a
                                    onClick={back}
                                    className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${isLoading || learnerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white"}`}>
                                    <FontAwesomeIcon icon={faChevronLeft}/>
                                </a>

                                {/* Current Page & Dynamic Paging */}
                                {Pages.map((page)=>(
                                    <a
                                        key={page}
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                            ${
                                                isLoading || learnerLoading ? "opacity-50 cursor-not-allowed" :
                                                page === pageState.currentFrontendPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } transition-all ease-in-out`}
                                            onClick={() => pageChange(page)}>
                                        {page}</a>
                                ))}

                                {/* Next */}
                                <a
                                    onClick={next}
                                    className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${isLoading || learnerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white"}`}>
                                    <FontAwesomeIcon icon={faChevronRight}/>
                                </a>
                            </nav>
                        </div>
                        </>
                    )
                }

            </div>



        </div>

        {/* Course Selector */}
        <BulkEnrollmentCourseSelectorModal open={openSelector} close={()=>{setOpenSelector(false)}} courselist={assigned_courses} currentCourse={course} setCurrentCourse={setCourse} courseType={formik.values.filter} setCourseType={formik} loading={courseListLoading} learnerloading={learnerLoading} numberOfEnrollees={numberOfEnrollees} resetPagination={()=>{pageChangeState('currentPage', 1), pageChangeState('currentFrontendPage', 1), setCurrentChunk(1)}} pageState={coursePageState} changePageState={coursePageChangeState}/>
        {/* Error */}
        <EnrollmentFailedModal isOpen={enrollmentFailed} onClose={()=>setEnrollmentFailed(false)}/>
        {/* Unenrollment */}
        <Unerollnment isOpen={blocker.state === "blocked"} close={()=>(blocker.reset())} onContinue={()=>{blocker.proceed()}}/>
        {/* Review Enrollment */}
        <ReviewEnrollment open={openReview} close={()=>{setOpenReview(false)}} enrollment={enrollment} enroll={handleEnrollment} enrolling={enrolling}/>
        {/* Complete Enrollment */}
        <ReviewEnrollment open={enrolled} close={()=>{setEnrolled(false), fetchLearner(course.id), setTimeout(()=>{setEnrollment([])},200)}} enrollment={enrollment} enrolled={true} />


        </>
    )
}
