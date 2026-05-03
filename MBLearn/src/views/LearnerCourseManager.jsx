import { faArrowDownShortWide, faArrowDownZA, faArrowUpAZ, faArrowUpWideShort, faBook, faBookBookmark, faBookmark, faChevronLeft, faChevronRight, faFilter, faMagnifyingGlass, faSearch, faSort, faXmark} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"
import { useCourseContext } from "../contexts/CourseListProvider"
import axiosClient from "../axios-client"
import { useStateContext } from "../contexts/ContextProvider"
import { useNavigate, useParams } from "react-router-dom"
import CourseLoading from "../assets/Course_Loading.svg"
import { Progress } from "../components/ui/progress"
// import { useCourse } from "../contexts/selectedcourseContext"
import CourseCard from "../modalsandprops/CourseCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useCourse } from "../contexts/Course"


export default function LearnerCourseManager() {
    const {status} = useParams();
    const {coursetypes, coursecategories} = useCourseContext();
    const [coursesStatus, setCoursesStatus] = useState(status || "enrolled");
    const [loading, setLoading] = useState(true)
    const [enrolled, setEnrolled] = useState([])
    const [isFiltered, setIsFiltered] = useState(false)
    const {user} = useStateContext();
    const [duration, setDuration] = useState();
    const navigate = useNavigate();
    const {setCourse} = useCourse()
    const [search, setSearch] = useState("")
    //const {SetCourse} = useCourse()

        // useEffect(() => {
        //      if(search.trim() === ""){
        //         pageChangeState('currentPage', 1)
        //         return;
        //     }

        //     setLoading(true);
        //     const handler = setTimeout(() => {
        //         fetchSearch();
        //     },1000);

        //     return () => {clearTimeout(handler)};
        // },[search])

        const [pageState, setPagination] = useState({
                currentPage: 1,
                perPage: 8,
                totalCourses: 0,
                lastPage:1,
                startNumber: 0,
                endNumber: 0,
                currentPerPage:0
            });

        const pageChangeState = (key, value) => {
            setPagination ((prev) => ({
                ...prev,
                [key]: value
            }))
        }

        useEffect(() => {
                pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
                pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalCourses))
            },[pageState.currentPage, pageState.perPage, pageState.totalCourses])

            //Next and Previous
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

            const pageChange = (page) => {
                if(loading) return;
                if(page > 0 && page <= pageState.lastPage){
                    pageChangeState("currentPage", page)
                }
            }

    const fetchCourses = (courseToFetch) => {
        setLoading(true)
        axiosClient.get(`/select-user-courses/${user.user_infos?.id}?enrollment_status[eq]=${courseToFetch}`,
            {
                params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage,
                }
            }
        )
        .then(({data}) => {
            console.log(data.data)
            setEnrolled(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            setLoading(false)
        }).catch((err)=> {
            console.log(err)
        })

    }

    const fetchSearch = () => {
        setLoading(true)
        axiosClient.get(`/search-Enrolledcourse/${user.user_infos?.id}`, {
            params: {
                q: search,
                enrollment_status: coursesStatus,
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        }).then(({data}) => {
            setEnrolled(data.data)
            setLoading(false)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
        }).catch((err) => {})
    }

    useEffect(() => {
        //console.log(enrolled)
        console.log("Fetching courses...:", status)
        console.log("Course Status", coursesStatus)
    },[coursesStatus])

   useEffect(() => {
    // Debounce handler
        setLoading(true);
        const handler = setTimeout(() => {
            if (search.trim() === "") {
                // No search input → fetch regular courses
                fetchCourses(coursesStatus);
            } else {
                // With search input → perform search
                fetchSearch();
            }
        }, 800); // adjust debounce delay as needed (500–1000ms)

        // Cleanup previous timeout before next trigger
        return () => clearTimeout(handler);
    }, [
        search,
        coursesStatus,
        pageState.currentPage,
        pageState.perPage,
    ]);

    const getStatusText = (status) => {
        switch (status) {
            case "enrolled":
                return "enrolled";
            case "ongoing":
                return "on-going";
            case "due-soon":
                return "due soon";
            case "finished":
                return "archived";
            case "past_due":
                return "past deadline";
            default:
                return "courses";
        }
    }


    return(
        <div className='grid grid-cols-4 grid-rows-[6.25rem_min-content_1fr_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Course Manager</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-4 row-span-1 pr-5 border-b mx-5 border-divider'>
                <h1 className='text-primary text-4xl font-header'>Course Manager</h1>
                <p className='font-text text-sm text-unactive' >Lets you manage learners' active enrolled courses and access archived courses for better tracking and organization.</p>
            </div>

            {/* Filter */}

            {/* Course List */}
            <div className="flex flex-row gap-2 pl-5 items-center col-span-1 py-2">
                {/* Duration Type */}
                <Select value={coursesStatus} onValueChange={(value) => {setCoursesStatus(value);}} disabled={loading}>
                    {/* ${fetching ? "opacity-50 hover:cursor-not-allowed":""} */}
                    <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full h-full bg-white text-base`}>
                        <SelectValue placeholder="Course Status" />
                    </SelectTrigger>
                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="ongoing">On-going</SelectItem>
                        <SelectItem value="due_soon">Due-soon</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="past_due">Past Deadline</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>

                </Select>

            </div>


            {/* Search */}
            <div className="col-start-3 col-span-2 flex flex-row justify-between items-center mr-5 border-divider py-2 gap-2">
                <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md font-text shadow-md w-full'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name='search'
                            value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                        />
                    <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                        onClick={() => {if(search){
                            setSearch("")
                            fetchCourses(coursesStatus);
                        }}}>
                        <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <div className="col-span-4 grid grid-rows-2 grid-cols-4 gap-2 px-5 py-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white w-full h-full rounded-md shadow-md"/>
                    ))}
                    </div>
                ) : enrolled.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 col-span-4">
                        <div>
                            <div className="flex items-center justify-center bg-primarybg w-32 aspect-square rounded-full">
                                <FontAwesomeIcon icon={faBookBookmark} className="text-primary text-5xl"/>
                            </div>
                        </div>
                        <p className="text-unactive font-text">No {getStatusText(coursesStatus)} courses found</p>
                    </div>
                ) : (
                    <div className="col-span-4 grid grid-rows-2 grid-cols-4 gap-2 px-5 py-2">
                        {
                            enrolled?.map((course) => (
                                // <div className='bg-white text-white h-full rounded-md shadow-md hover:scale-105 hover:cursor-pointer transition-all ease-in-out grid grid-rows-[min-content_1fr_1fr_min-content]'
                                //     onClick={() => {navigate(`/learner/course/${course.id}`), SetCourse(course)}}
                                // >
                                //     {/* Course Thumbnail */}
                                //     <div className="flex flex-row justify-end bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md p-4 gap-2">
                                //         {/* <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">Published</span> */}
                                //         <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{course.training_type}</span>
                                //     </div>
                                //     <div className='px-4 py-2 flex flex-col justify-center row-span-2'>
                                //     <h1 className='font-header text-sm text-primary'>{course.name}</h1>
                                //         <p className='font-text text-primary text-xs'>{course?.types[0]?.type_name} - {course?.categories[0]?.category_name}</p>
                                //         <p className='font-text text-xs text-unactive'>Course ID: {course.CourseID}</p>
                                //     </div>
                                //         {/* Progress */}
                                //     <div className="px-4 pb-5">
                                //         <div className="flex flex-row justify-between font-text text-unactive text-xs py-2">
                                //             <p>Progress</p>
                                //             <p>{course.progress} %</p>
                                //         </div>
                                //         <Progress value={course.progress}/>
                                //     </div>
                                //         {/* Datas */}
                                //     </div>
                                <CourseCard course={course} type='learnerCourseManager' click={()=>{navigate(`/learner/course/${course.id}`); setCourse(course);}}/>
                            ))
                        }
                    </div>
                )

            }
            <div className="mx-5 col-span-4 row-start-5 row-span-1 flex flex-row justify-between items-center py-3 border-t border-divider">
                {/* Total number of entries and only be shown */}
                <div>
                    {
                        loading ? <p className='text-sm font-text text-unactive'>Loading courses...</p>
                        :
                        <p className='text-sm font-text text-unactive'>
                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalCourses}</span> <span className='text-primary'>results</span>
                        </p>
                    }

                </div>
                {/* Paganation */}
                <div>
                    <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                            {/* Previous */}
                            <a
                                onClick={back}
                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </a>

                            {/* Current Page & Dynamic Paging */}
                            {
                                loading ? (
                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset text-primary`}>...</a>
                                ) : (
                                    Pages.map((page)=>(
                                        <a
                                            key={page}
                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                ${
                                                    page === pageState.currentPage
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                } transition-all ease-in-out`}
                                                onClick={() => pageChange(page)}>
                                            {page}</a>
                                    ))
                                )
                            }
                            <a
                                onClick={next}
                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </a>
                        </nav>

                </div>
            </div>

        </div>

    )
}
