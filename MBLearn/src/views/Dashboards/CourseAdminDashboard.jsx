import { faArrowLeft, faArrowRight, faArrowTrendDown, faArrowTrendUp, faArrowUp, faBook, faBookBookmark, faBookOpenReader, faCalendarCheck, faCalendarMinus, faCalendarXmark, faChevronCircleLeft, faChevronCircleRight, faChevronLeft, faChevronRight, faCircleCheck, faCircleMinus, faCircleUp, faCircleXmark, faClock, faGraduationCap, faMagnifyingGlass, faMugHot, faRightToBracket, faTimes, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Axios } from "axios";
import axiosClient from "MBLearn/src/axios-client";
import AnnouncmentCarousel from "MBLearn/src/modalsandprops/dashboardComponents/AnnouncementCarousel";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Calendar from "MBLearn/src/modalsandprops/dashboardComponents/Calendar";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CourseCard from "MBLearn/src/modalsandprops/CourseCard";
import { useFormik } from "formik";
import { Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem, } from "MBLearn/src/components/ui/select";
import { useCourse } from "MBLearn/src/contexts/Course";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "MBLearn/src/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis } from "recharts";




const CourseAdminDashboard = ({name, user}) => {
    // const {user} = useStateContext()
    const [tab, setTab] = useState("assigned")
    const [loading, setLoading] = useState(false)
    const [statisticsLoading, setStatisticsLoading] = useState(false)
    const [assignedCourse, setAssignedCourse] = useState([])
    const navigate = useNavigate()
    const {setCourse} = useCourse();
    const [activities, setActivities] = useState([])
    const [gettingActivities, setGettingActivities] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedCourseSatistics, setSelectedCourseStatistics] = useState();
    const [courseStats, setCourseStats] = useState([])

    const chartData = [{course: 'Course A', passed: 80, failed: 70},]
    const charData2 = [{course: 'Course A', onTime: 100, late: 10},]
   const chartData3 = [
        // October 2025
        { date: "2025-10-01", enrolled: 100, ongoing: 70, finished: 20, pastDue: 5 },
        { date: "2025-10-05", enrolled: 130, ongoing: 85, finished: 25, pastDue: 8 },
        { date: "2025-10-10", enrolled: 160, ongoing: 95, finished: 35, pastDue: 10 },
        { date: "2025-10-15", enrolled: 180, ongoing: 100, finished: 45, pastDue: 12 },
        { date: "2025-10-20", enrolled: 210, ongoing: 110, finished: 60, pastDue: 15 },
        { date: "2025-10-25", enrolled: 240, ongoing: 120, finished: 75, pastDue: 20 },
        { date: "2025-10-30", enrolled: 260, ongoing: 130, finished: 90, pastDue: 22 },

        // November 2025
        { date: "2025-11-01", enrolled: 270, ongoing: 140, finished: 100, pastDue: 25 },
        { date: "2025-11-05", enrolled: 300, ongoing: 150, finished: 120, pastDue: 28 },
        { date: "2025-11-10", enrolled: 320, ongoing: 160, finished: 140, pastDue: 30 },
        { date: "2025-11-15", enrolled: 340, ongoing: 170, finished: 160, pastDue: 32 },
        { date: "2025-11-20", enrolled: 360, ongoing: 175, finished: 180, pastDue: 35 },
        { date: "2025-11-25", enrolled: 380, ongoing: 165, finished: 200, pastDue: 37 },
        { date: "2025-11-30", enrolled: 400, ongoing: 160, finished: 220, pastDue: 40 },

        // December 2025
        { date: "2025-12-01", enrolled: 420, ongoing: 150, finished: 240, pastDue: 45 },
        { date: "2025-12-05", enrolled: 440, ongoing: 140, finished: 260, pastDue: 50 },
        { date: "2025-12-10", enrolled: 460, ongoing: 130, finished: 280, pastDue: 55 },
        { date: "2025-12-15", enrolled: 480, ongoing: 120, finished: 300, pastDue: 60 },
        { date: "2025-12-20", enrolled: 500, ongoing: 110, finished: 320, pastDue: 65 },
        { date: "2025-12-25", enrolled: 520, ongoing: 100, finished: 340, pastDue: 70 },
        { date: "2025-12-31", enrolled: 540, ongoing: 90, finished: 360, pastDue: 75 },
    ];



    const learner_timeline_data = () => {
        if(!selectedCourseSatistics) return [];
        return selectedCourseSatistics.learner_timeline.map((item) => ({
            date: item.recorded_at,
            enrolled: item.enrolled_count,
            ongoing: item.ongoing_count,
            finished: item.finished_count,
            pastDue: item.past_due_count,
        }))
    }

    const completionRateConfig = {
        passed: {
            label: 'Passed',
            color: 'hsl(146, 61%, 20%)',
        },
        failed: {
            label: 'Failed',
            color: 'hsl(0, 63%, 31%)',
        },
        notFinished: {
            label: 'Not Finished',
            color: 'hsl(0, 0%, 80%)',
        }
    };
    const ontTimeChartConfig = {
        onTime: {
            label: 'On-Time',
            color: 'hsl(218, 97%, 26%)',
        },
        late: {
            label: 'Late',
            color: 'hsl(218, 97%, 60%)',
        },
        notFinished: {
            label: 'Not Finished',
            color: 'hsl(0, 0%, 80%)',
        }
    }
    const LearnerTimeLineChartConfig = {
        enrolled: {
            label: "Enrolled",
            color: 'hsl(218, 97%, 26%)',
        },
        ongoing: {
            label: "Ongoing",
            color: 'hsl(218, 97%, 60%)',
        },
        finished: {
            label: "Finished",
            color: 'hsl(146, 61%, 20%)',
        },
        pastDue: {
            label: "Past Due",
            color: 'hsl(0, 63%, 31%)',
        }

    }

    const CompletionAnalysis = (rating) => {
    if(rating === 0){
        return (
            <p>Not enough data to provide analysis</p>
        )
    }
    else if (rating < 20) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendDown}/> {rating}% - Very few completions — Needs major improvement.</p>
        )
    } else if (rating < 40) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendDown}/> {rating}% - Low engagement — review course delivery or content clarity.</p>
        )
    } else if (rating < 60) {
        return (
            <p><FontAwesomeIcon icon={faArrowRight}/> {rating}% - Moderate completion — some learners may have faced difficulties.</p>
        )
    } else if (rating < 80) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendUp}/> {rating}% - High completion rate — learners are generally satisfied.</p>
        )
    } else {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendUp}/> {rating}% - Most learners completed the course — strong engagement.</p>
        )
    }
    }

    const OntimeAnalysis = (rating) => {
    if(rating === 0){
        return (
            <p>Not enough data to provide analysis</p>
        )
    }
    else if (rating < 20) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendDown}/> {rating}% - Severe delay issues — Most learners complete late, indicating poor scheduling or engagement. </p>
        )
    } else if (rating < 40) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendDown}/> {rating}% - Frequent late completions — Majority of learners fail to meet the target schedule.</p>
        )
    } else if (rating < 60) {
        return (
            <p><FontAwesomeIcon icon={faArrowRight}/> {rating}% - Some lateness observed — Many learners meet deadlines, but delays are noticeable.</p>
        )
    } else if (rating < 80) {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendUp}/> {rating}% - Strong completion discipline. — Most learners complete on time with few delays. </p>
        )
    } else {
        return (
            <p><FontAwesomeIcon icon={faArrowTrendUp}/>{rating}% - Learners are highly punctual. — Almost all learners finish on time.</p>
        )
    }
    }

    useEffect(() => {
        fetchActivities();
        fetchCourseStatistics();
        fetchRecentCourses();
    },[]);

    const fetchActivities = () => {
        setGettingActivities(true);
        axiosClient.get('/dashboard/courseAdmin')
        .then(({data}) => {
            console.log(data);
            setActivities(data);
            setGettingActivities(false);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const formik = useFormik({
        initialValues: {
            courseType: "myCourses"
        },
    })

    const fetchCourseStatistics = () => {
        setStatisticsLoading(true);
        axiosClient.get('/coursesStatistics')
        .then(({data}) => {
            console.log(data);
            setStatisticsLoading(false);
            setCourseStats(data)
            setSelectedCourseStatistics(data[0])
        })
        .catch((err) => {
            console.log(err);
        })
    }

    // const fetchCourses = (courses) => {

    //     setAssignedCourse([])
    //     setLoading(true);

    //     axiosClient.get(`/select-user-assigned-courses/${user.user_infos.id}`,{
    //         params: {
    //             page: 1,
    //             //pageState.currentPage,
    //             perPage: 4
    //             //pageState.perPage,
    //         }
    //     })
    //     .then(({ data }) => {
    //         setAssignedCourse(data.data)
    //         pageChangeState("totalCourses", data.total)
    //         pageChangeState("lastPage", data.lastPage)
    //         setLoading(false)
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     })
    //}

    const fetchRecentCourses = () => {
        setLoading(true);
        axiosClient.get('/records',
            {
                params: {
                    page: pageState.currentPage,
                    per_page: pageState.perPage,
                }
            }
        )
        .then(({data}) => {
            console.log(data);
            setAssignedCourse(data.data)
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const [pageState, setPagination] = useState({
            currentPage: 1,
            perPage: 4,
            totalCourses: 0,
            lastPage:1,
            startNumber: 0,
            endNumber: 0,
            currentPerPage:0
        });

    useEffect(() => {
        fetchRecentCourses();
    }, [formik.values.courseType, pageState.currentPage, pageState.perPage]);

    const pageChangeState = (key, value) => {
        setPagination ((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    const back = () => {
        if (loading) return;
        if (pageState.currentPage > 1){
            pageChangeState("currentPage", pageState.currentPage - 1)
            pageChangeState("startNumber", pageState.perPage - 4)
        }
    }
    const next = () => {
        if (loading) return;
        if (pageState.currentPage < pageState.lastPage){
            pageChangeState("currentPage", pageState.currentPage + 1)
        }
    }

    const Pages = [];
    for(let p = 1; p <= pageState.lastPage; p++){
        Pages.push(p)
    }

    return(
        <div className="grid h-screen w-full grid-cols-4
                        grid-rows-[6.25rem_min-content_1fr_min-content_min-content]
                        xl:grid-rows-[6.25rem_min-content_1fr]">

        {/* Header */}
        <div className='flex flex-col justify-center col-span-2 row-span-1  border-b border-divider
                                ml-3
                                xl:pr-5
                                sm:ml-0'>
                    <p className='text-xs text-unactive'>Good Day!  </p>
                    <p className='font-header text-primary text-3xl'>{name}</p>
                    <p className='font-text text-xs text-unactive'>{user.user_infos.employeeID} | {user.user_infos.roles[0].role_name}</p>
                    {/* <p className='font-text text-unactive
                                    text-xs
                                    xl:text-sm
                                    sm:text-xs'>System Admin Dashboard, A centralized hub for system administrators to manage users, monitor system activity.</p> */}
                </div>
                <div className='border-b border-divider  flex flex-row justify-end items-center col-span-2 gap-4
                                mr-3
                                sm:mr-4'>
                    <div className='flex-col justify-end items-end flex leadeing-tigth'>
                        <p className='font-header text-primary'>Course Admin Dashboard</p>
                        <p className='font-text text-xs text-unactive'>A centralized hub for course administration.</p>
                    </div>
                    <div className='aspect-square bg-secondaryprimary rounded-full flex justify-center items-center
                                    w-16 h-16
                                    xl:w-20 xl:h-20 xl:mr-5
                                    sm:w-16 sm:h-16'>
                        <FontAwesomeIcon icon={faBookOpenReader} className='text-primary text-xl xl:text-2xl sm:text-xl'/>
                    </div>
                </div>
        <ScrollArea className='col-span-4 h-[calc(100vh-6.25rem)]'>
            <div className="grid grid-cols-4 grid-rows-[min-content_1fr] py-2 gap-2">
                {/* Annoucenment */}
                <div className='row-span-1 col-span-3 row-start-1'>
                    <AnnouncmentCarousel/>
                </div>
                {/* Courses Carousel */}
                <div className='grid grid-rows-[min-content_1fr] col-span-3 grid-cols-4 gap-2'>
                    <div className="col-span-2 flex flex-col gap-1 leading-none">
                        <p className="font-header text-primary">Recent Opened Courses</p>
                        <p className="font-text text-xs text-unactive">List of recently opened course of the user</p>
                    </div>
                    {/* Pagination */}
                    <div className="col-start-4 flex flex-row justify-end items-center">
                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                            {/* Previous */}
                            <a
                                onClick={back}
                                className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset  transition-all ease-in-out ${loading ? "opacity-50 cursor-not-allowed":"hover:bg-primary hover:text-white"}`}>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </a>

                            {/* Current Page & Dynamic Paging */}
                            {/* {
                                isLoading ? (
                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>
                                    ...</a>
                                ) : (

                                )
                            } */}

                            {
                                Pages.map((page)=>(
                                    <a
                                        key={page}
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                            ${
                                                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white hover:cursor-pointer"
                                            }
                                            ${
                                                page === pageState.currentPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } transition-all ease-in-out`}
                                            onClick={() => pageChange(page)}>
                                        {page}</a>
                                ))
                            }
                            <a
                                onClick={next}
                                className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset  transition-all ease-in-out ${loading ? "opacity-50 cursor-not-allowed":"hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </a>
                        </nav>
                    </div>

                    {/* Courses */}
                    <div className="col-span-4 grid grid-cols-2 gap-2 h-full
                                    lg:grid-cols-4">
                        {
                            //assignedCourse.length > 0
                            loading ?
                                    Array.from({length: 4}).map((_,i) =>(
                                        <div key={i} className="animate-pulse bg-white w-full xl:h-full h-[8.25rem] rounded-md shadow-md border border-divider"/>
                                    ))
                            : assignedCourse.length === 0 ?
                                <div className="py-3 col-span-2 md:py-0 md:col-span-4 flex flex-col items-center justify-center gap-2">
                                    <div className="min-h-10 min-w-10 w-20 h-20 bg-primarybg rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-primary text-4xl"/>
                                    </div>
                                    <p className="font-text text-unactive text-xs">You dont have any {formik.values.courseType === "myCourses" ? "inputted courses yet" : "assigned courses yet"} </p>
                                </div>
                            : assignedCourse.map((course)=>(
                                <CourseCard key={course.id} course={course} type='courseAdmin' click={()=>{navigate(`/courseadmin/course/${course.id}`); setCourse(course)}}/>
                            ))
                        }
                    </div>
                </div>
                {/* Activities */}
                <div className='row-start-1 col-start-4 row-span-2 flex flex-col gap-2 xl:pr-5'>
                    <div className="">
                        <h1 className="font-header text-primary text-base">Activities</h1>
                        <p className="font-text text-unactive text-xs">Tracks your learners concerns and activities.</p>
                    </div>
                    <ScrollArea className="border border-divider rounded-md bg-white w-full h-[calc(100vh-10.5rem)]">
                        <div className="p-4 flex flex-col gap-2">
                            {
                                gettingActivities ?
                                Array.from({length: 3}).map((_, i) => (
                                    <div className="w-full h-20 bg-white rounded-md shadow-md flex items-center justify-between border border-divider animate-pulse" key={i}/>
                                ))
                                :
                                activities.length === 0 ?
                                <div className="h-[calc(100vh-15rem)] w-full flex flex-col justify-center items-center gap-2">
                                    <div>
                                        <div className='bg-primarybg w-24 aspect-square rounded-full flex items-center justify-center text-4xl text-primary'>
                                            <FontAwesomeIcon icon={faMugHot} />
                                        </div>
                                    </div>

                                    <p className='font-header text-xl text-primary'>You are vacant!</p>
                                    <p className='text-unactive font-text text-xs text-center'>You dont have any upcoming or ongoing activities yet</p>
                                </div>
                                :
                                activities.map((activity) => (
                                    activity.activityType === "SelfEnrollmentRequest" ?
                                    <div className="border-divider bg-white border rounded-md flex flex-row gap-4 p-4 hover:border-primary hover:cursor-pointer shadow-md transition-all ease-in-out"
                                        onClick={()=>{navigate(`/courseadmin/course/${activity.course_id}`);}}>
                                        <div>
                                            <div className="min-w-10 min-h-10 bg-primarybg rounded-md flex items-center justify-center text-primary">
                                                <FontAwesomeIcon icon={faBookBookmark}/>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-header text-sm text-primary">Self-Enrollment Approval</p>
                                            <p className="text-xs font-text">{activity.pending_requests_count} Learner request enrollment for the course: <span className="font-header">{activity.course_name}</span></p>
                                        </div>
                                    </div>
                                    : activity.activityType === "DueSoonLearners" ?
                                    <div className="border-divider bg-white border rounded-md flex flex-row gap-4 p-4 hover:border-primary hover:cursor-pointer shadow-md transition-all ease-in-out"
                                        onClick={()=>{navigate(`/courseadmin/course/${activity.course_id}`);}}>
                                        <div>
                                            <div className="min-w-10 min-h-10 bg-primarybg rounded-md flex items-center justify-center text-primary">
                                                <FontAwesomeIcon icon={faClock}/>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-header text-sm text-primary">Due soon Learner</p>
                                            <p className="text-xs font-text">{activity.due_soon_learners_count} Learner are in for due soon status for the course: <span className="font-header">{activity.course_name}</span></p>
                                        </div>
                                    </div>
                                    :
                                    <div className="border-divider bg-white border rounded-md flex flex-row gap-4 p-4 hover:border-primary hover:cursor-pointer shadow-md transition-all ease-in-out"
                                        onClick={()=>{navigate(`/courseadmin/course/${activity.course_id}`); }}>
                                        <div>
                                            <div className="min-w-10 min-h-10 bg-primarybg rounded-md flex items-center justify-center text-primary">
                                                <FontAwesomeIcon icon={faRightToBracket}/>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-header text-sm text-primary">Subject for Retake</p>
                                            <p className="text-xs font-text">{activity.subject_for_retake_count} Learner request for a retake for the course: <span className="font-header">{activity.course_name}</span></p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>

                <div className="py-2 col-span-4 grid grid-cols-4 grid-row-[min-content_1fr] gap-2 pr-4">
                    <div className="col-span-2 flex flex-col gap-1 leading-none justify-center">
                        <p className="font-header text-primary">Course Performance Overview</p>
                        <p className="font-text text-xs text-unactive">List of course performance and effectivity</p>
                    </div>

                    <div className="w-full col-span-4 grid grid-cols-4 gap-2">
                        {/* List of Courses */}
                        <ScrollArea className="border border-divider rounded-md bg-white h-[calc(100vh-11.2rem)]">
                            <div className="p-4 flex flex-col gap-2">
                                {
                                    statisticsLoading ?
                                    Array.from({length: 5}).map((i)=>(
                                        <div className="rounded-md bg-white border animate-pulse w-full h-28 shadow-md border-divider">

                                        </div>
                                    ))
                                    : courseStats.length === 0 ? null
                                    : courseStats.map((course)=>(
                                    <div className="relative rounded-md bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] w-full h-40 cursor-pointer shadow-md"
                                        onClick={()=>{setSelectedCourseStatistics(course)}}>
                                        {
                                            course.image_path !== "null" ?
                                            <div className={`w-full h-full bg-cover rounded-t-md`}
                                                style={{ backgroundImage: `url(${course.image_path})` }}>
                                            </div>
                                            : null
                                        }
                                        <div className={`absolute bg-gradient-to-t from-black via-black/80 to-transparent w-full h-full p-4 flex flex-col justify-between top-0 left-0 rounded`}>
                                            <div className="flex flex-row justify-between w-full">
                                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.training_type?.charAt(0).toUpperCase()}{course?.training_type?.slice(1)}</span>
                                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.courseDuration} hours</span>
                                            </div>
                                            <div>
                                                <p className='font-text text-xs text-white'>{course.categories?.category_name || ""} - {course.career_level?.name}</p>
                                                <h1 className='font-header text-sm text-white'>{course.courseName}</h1>
                                                <p className='font-text text-xs text-white'>Course ID: {course.courseID}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                }
                            </div>
                        </ScrollArea>
                        <div className="col-span-3 grid grid-cols-4 grid-rows-[min-content_1fr_1fr] gap-2">
                            {
                                statisticsLoading ?
                                <div className="col-span-4 p-4 bg-white border rounded-md animate-pulse h-20 border-divider"/>
                                :
                                !selectedCourseSatistics ? null :
                                <div className="relative col-span-4 rounded-md bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] w-full h-20 cursor-pointer shadow-md">
                                    {
                                            selectedCourseSatistics.image_path !== "null" ?
                                            <div className={`w-full h-full bg-cover rounded-t-md bg-center`}
                                                style={{ backgroundImage: `url(${selectedCourseSatistics.image_path})` }}>
                                            </div>
                                            : null
                                        }
                                    <div className="absolute bg-gray-950 bg-opacity-70 p-4 rounded-md flex flex-row justify-between w-full h-full top-0 left-0">
                                        <div>
                                            <p className="font-header text-white text-xl">{selectedCourseSatistics.courseName}</p>
                                            <p className="font-text text-xs text-white">Course ID: {selectedCourseSatistics.courseID}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-text text-xs text-white">Total Learner</p>
                                            <p className="text-xl font-header text-white">{selectedCourseSatistics.total_learners}</p>
                                        </div>
                                    </div>
                                </div>
                            }
                            {/* Course Completion Rate */}
                            {
                                statisticsLoading ?
                                <div className="col-span-2 p-4 bg-white border rounded-md animate-pulse h-full border-divider"/>
                                :
                                !selectedCourseSatistics ? null :
                                <div className="col-span-2 w-full h-full border border-divider rounded-md bg-white flex flex-col items-start gap-2 p-4">
                                    <div>
                                        <p className="font-header text-primary">Course Completion Rate</p>
                                        <p className="font-text text-xs text-unactive">Display the number of passed and failed learner</p>
                                    </div>
                                    <div className="grid grid-cols-[1fr_min-content] w-full h-fit gap-2">
                                        <div className="flex items-center justify-center w-full">
                                            <ChartContainer  config={completionRateConfig} className= "h-28 aspect-[2/1] flex flex-col items-center justify-center">
                                                <ResponsiveContainer width="100%"  height="100%">

                                                <RadialBarChart data={selectedCourseSatistics.completionData}
                                                    startAngle={180}
                                                    endAngle={0}
                                                    innerRadius={100}
                                                    outerRadius={130}
                                                    cx="50%"
                                                    cy="100%"
                                                    >
                                                    <RadialBar dataKey="passed" fill="var(--color-passed)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/>
                                                    <RadialBar dataKey="failed" fill="var(--color-failed)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/>
                                                    <RadialBar dataKey="notFinished" fill="var(--color-notFinished)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/>
                                                    <text
                                                        x="50%"
                                                        y="70%" // adjust to vertically center within the half-circle
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                        x="50%"
                                                        className="fill-foreground text-2xl font-bold"
                                                        >
                                                        {selectedCourseSatistics?.ratings?.completionRate || 0}%
                                                        </tspan>
                                                        <tspan
                                                        x="50%"
                                                        dy="20"
                                                        className="fill-muted-foreground text-xs font-medium"
                                                        >
                                                        Completion Rate
                                                        </tspan>
                                                    </text>
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />

                                                    </RadialBarChart>
                                                </ResponsiveContainer>

                                            </ChartContainer>
                                        </div>
                                        <div className="flex flex-col justify-between text-left whitespace-nowrap">
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>Passed Learners</p>
                                                <div className="font-header text-xl text-green-900 flex flex-row items-center gap-1">
                                                    <p>{selectedCourseSatistics.completionData[0].passed}</p>
                                                    <FontAwesomeIcon icon={faCircleCheck} className=""/>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>Failed Learners</p>
                                                <div className="font-header text-xl text-red-900 flex flex-row justify-end items-center gap-1">
                                                    <p>{selectedCourseSatistics.completionData[0].failed}</p>
                                                    <FontAwesomeIcon icon={faCircleXmark} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>Not Finished Learners</p>
                                                <div className="font-header text-xl text-uncative flex flex-row justify-end items-center gap-1">
                                                    <p>{selectedCourseSatistics.completionData[0].notFinished}</p>
                                                    <FontAwesomeIcon icon={faCircleMinus} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {/* On-Time CompletionRate */}
                            {
                                statisticsLoading ?
                                <div className="col-span-2 p-4 bg-white border rounded-md animate-pulse h-full border-divider"/>
                                :
                                !selectedCourseSatistics ? null :
                                <div className="col-span-2 w-full h-full border border-divider rounded-md bg-white flex flex-col item-start gap-2 p-4">
                                    <div>
                                        <p className="font-header text-primary">On-time Completion Rate</p>
                                        <p className="font-text text-xs text-unactive">Display the number of on-time and late completer learners</p>
                                    </div>
                                    <div className="grid grid-cols-[1fr_min-content] w-full h-fit gap-2">
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <ChartContainer  config={ontTimeChartConfig} className= "h-28 aspect-[2/1] flex flex-col items-center justify-center">
                                                <ResponsiveContainer width="100%"  height="100%">

                                                <RadialBarChart data={selectedCourseSatistics.onTimeCompletionData}
                                                    startAngle={180}
                                                    endAngle={0}
                                                    innerRadius={100}
                                                    outerRadius={130}
                                                    cx="50%"
                                                    cy="100%"
                                                    >
                                                    <RadialBar dataKey="onTime" fill="var(--color-onTime)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/>
                                                    <RadialBar dataKey="late" fill="var(--color-late)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/>
                                                    {/* <RadialBar dataKey="notFinished" fill="var(--color-notFinished)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2"/> */}
                                                    <text
                                                        x="50%"
                                                        y="70%" // adjust to vertically center within the half-circle
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                        x="50%"
                                                        className="fill-foreground text-2xl font-bold"
                                                        >
                                                        {selectedCourseSatistics?.ratings?.onTimeCompletionRate || 0}%
                                                        </tspan>
                                                        <tspan
                                                        x="50%"
                                                        dy="20"
                                                        className="fill-muted-foreground text-xs font-medium"
                                                        >
                                                        On-Time Rate
                                                        </tspan>
                                                    </text>
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />

                                                    </RadialBarChart>
                                                </ResponsiveContainer>

                                            </ChartContainer>
                                        </div>
                                        <div className="flex flex-col justify-start text-left whitespace-nowrap">
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>On-Time Completers</p>
                                                <div className="font-header text-xl text-primary flex flex-row items-center gap-1">
                                                    <p>{selectedCourseSatistics.onTimeCompletionData[0].onTime}</p>
                                                    <FontAwesomeIcon icon={faCalendarCheck} className=""/>
                                                    {/* Raw Number */}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>Late Completers</p>
                                                <div className="font-header text-xl text-[hsl(218,97%,60%)] flex flex-row justify-end items-center gap-1">
                                                    <p>{selectedCourseSatistics.onTimeCompletionData[0].late}</p>
                                                    <FontAwesomeIcon icon={faCalendarXmark} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-unactive">
                                                <p>Not Finished Learners</p>
                                                <div className="font-header text-xl text-uncative flex flex-row justify-end items-center gap-1">
                                                    <p>{selectedCourseSatistics.completionData[0].notFinished}</p>
                                                    <FontAwesomeIcon icon={faCalendarMinus} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {

                                statisticsLoading ?
                                <div className="col-span-4 p-4 bg-white border rounded-md animate-pulse h-full border-divider"/>
                                :
                                !selectedCourseSatistics ? null :
                                <div className="col-span-4 w-full h-full border border-divider rounded-md bg-white flex flex-col">
                                    <div className="p-4">
                                        <p className="font-header text-primary">Course Engagements</p>
                                        <p className="font-text text-xs text-unactive">Counts how many learner engage with the given course daily</p>
                                    </div>
                                    <ChartContainer  config={LearnerTimeLineChartConfig } className= "h-32 aspect-[2/1] flex flex-col items-center justify-center">
                                        <ResponsiveContainer width="100%"  height="100%">
                                            <AreaChart data={learner_timeline_data()} className="h-full w-full"
                                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    {Object.entries(LearnerTimeLineChartConfig).map(([key, { color }]) => (
                                                        <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <CartesianGrid vertical={false}/>
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value)
                                                        return format(date, "MM-dd-yy");
                                                    }}/>
                                                <ChartTooltip cursor={false}
                                                    content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => {
                                                        const date = new Date(v)
                                                        return format(date, "MMMM dd yyyy");
                                                    }}/>}/>
                                                {/* <Area dataKey="engagement" type="natural" fill="url(#fillEngagement)" stroke="var(--color-engagement)" stackId="a"/> */}
                                                    <Area
                                                        dataKey="enrolled"
                                                        type="natural"
                                                        fill="url(#fillenrolled)"
                                                        stroke={LearnerTimeLineChartConfig.enrolled.color}
                                                        stackId="a"
                                                    />
                                                    <Area
                                                        dataKey="ongoing"
                                                        type="natural"
                                                        fill="url(#fillongoing)"
                                                        stroke={LearnerTimeLineChartConfig.ongoing.color}
                                                        stackId="b"
                                                    />
                                                    <Area
                                                        dataKey="finished"
                                                        type="natural"
                                                        fill="url(#fillfinished)"
                                                        stroke={LearnerTimeLineChartConfig.finished.color}
                                                        stackId="c"
                                                    />
                                                    <Area
                                                        dataKey="pastDue"
                                                        type="natural"
                                                        fill="url(#fillpastDue)"
                                                        stroke={LearnerTimeLineChartConfig.pastDue.color}
                                                        stackId="d"
                                                    />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
        </div>
    )
}
export default CourseAdminDashboard;
