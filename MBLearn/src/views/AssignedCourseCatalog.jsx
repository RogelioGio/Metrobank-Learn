import { faArrowDownShortWide, faArrowDownZA, faArrowUpAZ, faArrowUpWideShort, faBook, faBookBookmark, faBookmark, faChalkboard, faChevronLeft, faChevronRight, faExclamationTriangle, faFilter, faFloppyDisk, faFolderPlus, faMagnifyingGlass, faPen, faPersonChalkboard, faSearch, faSort, faSpinner, faSwatchbook, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Helmet } from "react-helmet"
import AssignedCourseCatalogCard from "../modalsandprops/AssignedCourseCatalogCard"
import { useEffect, useState } from "react"
import CourseFilterProps from "../modalsandprops/CourseFilterProps"
import { useStateContext } from "../contexts/ContextProvider"
import axiosClient from "../axios-client"
import { use } from "react"
import CourseLoading from "../assets/Course_Loading.svg"
import { set } from "date-fns"
import AddCourseModal from "../modalsandprops/AddCourseModal"
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
import { useFormik } from "formik"
import CourseCard from "../modalsandprops/CourseCard"

import { useNavigate } from "react-router"
import { useCourse } from "../contexts/Course"
import { Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,} from "../components/ui/select"



export default function AssignedCourseCatalog() {
    const {coursetypes, coursecategories} = useCourseContext();
    const {user} = useStateContext();
    const [loading, setLoading] = useState(true);
    const [assigned_course, setAssignedCourse] = useState([]);
    const [tab, setTab] = useState("myCourses");
    const [openAddCourse, setOpenAddCourse] = useState(false);
    const [isFiltered, setFiltered] = useState(false);
    const {setCourse} = useCourse();
    const navigate = useNavigate();
    const [search, setSearch] = useState("")


    useEffect(() => {
        setCourse(null)
    },[])

    useEffect(() => {
        if(search == ""){
            pageChangeState('currentPage', 1)
            getCourse();
            return;
        }

        setLoading(true);
        const handler = setTimeout(() => {
            searchCourses();
        },1000);

        return () => {clearTimeout(handler)};
    },[search]);


    const courseFormik = useFormik({
        initialValues: {
            courseType: "myCourses",
        },
    })

    const fetchCourses = (typeOfCourse) => {
        setLoading(true)
        if(typeOfCourse === "myCourses"){
            axiosClient.get(`/select-user-added-courses/${user.user_infos?.id}`,{
                params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage,
                }
            })
            .then(({data}) => {
                setAssignedCourse(data.data)
                pageChangeState("totalCourses", data.total)
                pageChangeState("lastPage", data.lastPage)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err);
            })
        } else if(typeOfCourse ==="assigned"){

        } else if(typeOfCourse === "archived"){
            axiosClient.get('/courses', {
                params: {
                    page: pageState.currentPage,
                    perPage: 6,
                }
            })
            .then(({ data }) => {
                setAssignedCourse(data.data.data)
                pageChangeState("totalCourses", data.total)
                pageChangeState("lastPage", data.lastPage)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }

    const getCourse = () => {
        setLoading(true)
        axiosClient.get(`/select-user-assigned-courses/${user.user_infos?.id}`,{
            params: {
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        })
        .then(({ data }) => {
            setAssignedCourse(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
        })
    }
    const searchCourses = () => {
        setLoading(true)
        axiosClient.get(`/search-Assignedcourse/${user.user_infos.id}`, {
            params: {
                q: search,
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        }).then(({data})=>{
            setAssignedCourse(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            setLoading(false)
        }).catch((err)=>{console.log(err)})
    }


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

        useEffect(()=>{
            // fetchCourses(courseFormik.values.courseType);
            setLoading(true);
            const handler = setTimeout(() => {
                    if (search.trim() === "") {
                        // No search text → regular user fetch
                        fetchCourses();
                    } else {
                        // With search text → perform search
                        fetchSearch();
                    }
                }, 500); // shorter debounce for smoother feel

                // Cleanup to prevent multiple triggers
            return () => clearTimeout(handler);
        },[pageState.currentPage, pageState.perPage, courseFormik.values.courseType, search])

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

        const pageChange = (page) => {
            if(loading) return;
            if(page > 0 && page <= pageState.lastPage){
                pageChangeState("currentPage", page)
            }
        }


        const getPages = () => {
            const {currentPage, lastPage} = pageState;
            const pages = [];

            const firstPages = 3; // always show first 3 pages
            const lastPages = 3;  // always show last 3 pages
            const windowSize = 3;

            for (let i = 1; i <= Math.min(firstPages, lastPage); i++) {
                pages.push(i);
            }

            let windowStart = Math.max(currentPage - 1, firstPages + 1);
            let windowEnd = Math.min(currentPage + 1, lastPage - lastPages);

            if (windowStart > firstPages + 1) {
                pages.push('...');
            }

            for (let i = windowStart; i <= windowEnd; i++) {
                pages.push(i);
            }

            if (windowEnd < lastPage - lastPages) {
                pages.push('...');
            }


            for (let i = Math.max(lastPage - lastPages + 1, firstPages + 1); i <= lastPage; i++) {
            pages.push(i);
            }

            return pages;

        }
        const Pages = getPages();


        const formik = useFormik({
            initialValues: {
                type: "",
                category: "",
                training_type: "",
            },
            onSubmit: (values) => {
                console.log(values);
                setFiltered(true)
            }
        })

        const clearFilter = () => {
            setFiltered(false)
            formik.resetForm()
        }




    return(
    <>
        <div className='grid grid-cols-4 h-full w-full
                        grid-rows-[6.25rem_min-content_min-content_1fr_min-content]
                        xl:grid-rows-[6.25rem_min-content_1fr_min-content]'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Course Manager</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center row-span-1 border-b border-divider
                            col-start-1 row-start-1 col-span-3 ml-3
                            xl:col-span-4
                            sm:col-span-4 sm:mx-4'>
                <h1 className='text-primary font-header
                                text-xl
                                sm:text-2xl
                                xl:text-4xl'>Course Manager</h1>
                <p className='font-text text-unactive
                                text-xs
                                xl:text-sm
                                sm:text-xs' >View and manage the courses for easy course access and tracking.</p>
            </div>

            {/* Search */}
            <div className="col-span-2 py-2 col-start-3 pr-5">
                <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                        name='search'
                        value={search}
                        onChange={(e)=>{setSearch(e.target.value)}}
                    />
                    <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                        onClick={() => {if(search){
                            setSearch("")
                            getCourse();
                        }}}>
                        <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                    </div>
                </div>
            </div>


            {/* Course Catalog */}
            <div className = {`grid px-3 py-2 col-span-4 grid-cols-2 grid-rows-3 gap-2
                                md:pr-5 md:pl-4
                                lg:grid-cols-4 lg:grid-rows-2`}>
                {
                    loading ?
                    Array.from({length: 8 }).map((_, index) => (
                                <div key={index} className="animate-pulse bg-white w-full h-full rounded-md shadow-md border"/>
                    ))
                    :assigned_course.length === 0 ?
                    <div className="col-span-4 row-span-2 flex flex-col justify-center items-center gap-4">
                        <div className="flex items-center justify-center w-28 h-28 bg-primarybg rounded-full text-primary">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl"/>
                        </div>
                        <p className="text-unactive font-text text-sm">There is no courses that have the given criteria.</p>
                    </div>
                    :
                    assigned_course.map((course, index) => (
                        <div className="grid grid-rows-[1fr_min-content] bg-white rounded-md shadow-md cursor-pointer" key={course.id}
                            onClick={()=>{setCourse(course), navigate(`/courseadmin/course/${course.id}`)}}>
                            <div className="bg-gradient-to-t rounded-t-md  from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] relative">
                                <div className={`w-full h-full bg-cover rounded-t-md`}
                                    style={{ backgroundImage: `url(${course.image_path})` }}>
                                </div>
                                <div className="absolute bg-gradient-to-t from-black via-black/80 to-transparent h-full w-full p-4 -top-0 left-0 rounded-t-md text-white flex flex-col justify-between">
                                    <div className="flex flex-row justify-between">
                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.training_type?.charAt(0).toUpperCase()}{course?.training_type?.slice(1)}</span>
                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.courseDuration} hours</span>
                                    </div>

                                    <div>
                                        <h1 className='font-header text-sm text-white'>{course.courseName}</h1>
                                        <p className='font-text text-xs text-white'>Course ID: {course.courseID}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid-cols-[1fr_min-content_1fr_min-content_1fr] gap-2 md:grid hidden p-4">
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-xs font-text text-unactive">On-going</p>
                                        <p className="text-sm font-header text-primary">{course.ongoing}</p>
                                    </div>
                                    <div className="w-[1px] h-full bg-divider"/>
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-xs font-text text-unactive">Due-soon</p>
                                        <p className="text-sm font-header text-primary">{course.due_soon}</p>
                                    </div>
                                    <div className="w-[1px] h-full bg-divider"/>
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-xs font-text text-unactive">Past-Due</p>
                                        <p className="text-sm font-header text-primary">{course.past_due}</p>
                                    </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Pagination */}
            <div className="mx-5 col-span-4 row-start-5 row-span-1 flex flex-row justify-between items-center py-3">
                {/* Total number of entries and only be shown */}
                <div>
                    {
                        loading ?
                        <div className='flex flex-row items-center gap-2'>
                            <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2'/>
                            <p className='text-sm font-text text-unactive'>Loading courses...</p>
                        </div>
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
                                Pages.map((page)=>(
                                    <a
                                        key={page}
                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset hover:cursor-pointer
                                            ${
                                                page === pageState.currentPage
                                                ? 'bg-primary text-white'
                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                            } transition-all ease-in-out  ${loading ? "opacity-50" : ""} `}
                                            onClick={() => pageChange(page)}>
                                        {page}</a>
                                ))
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

        {/* Add Course */}
        <AddCourseModal open={openAddCourse} onClose={()=>setOpenAddCourse(false)} tab={tab} refresh={()=>fetchCourses("myCourses")}/>
        </>
    )
}
