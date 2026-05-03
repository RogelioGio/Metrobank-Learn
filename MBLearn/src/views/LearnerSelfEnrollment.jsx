import { Helmet } from "react-helmet"
import axiosClient from "../axios-client"
import { useContext, useEffect, useState } from "react"
import { FerrisWheel } from "lucide-react"
import { faArrowDownShortWide, faArrowDownZA, faArrowUpAZ, faArrowUpWideShort, faChevronLeft, faChevronRight, faFilter, faMagnifyingGlass, faSearch, faSort, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCourseContext } from "../contexts/CourseListProvider"
import AssignedCourseCatalogCard from "../modalsandprops/AssignedCourseCatalogCard"
import CourseLoading from "../assets/Course_Loading.svg"
import SelfEnrollmentModal from "../modalsandprops/SelfEnrollmentModal"
import TraningDurationModal from "../modalsandprops/TrainingDurationModal"
import React from "react"
import { useStateContext } from "../contexts/ContextProvider"
import { format } from "date-fns"
import SelfEnrollmentSuccessfullyModal from "../modalsandprops/SelfEnrollmentSuccessfullyModal"
import CourseCard from "../modalsandprops/CourseCard"
import { useNavigate } from "react-router"
import { useCourse } from "../contexts/Course"
import {   Select,
            SelectTrigger,
            SelectValue,
            SelectContent,
            SelectItem  } from "../components/ui/select"




export default function LearnerSelfEnrollment() {
    const {user} = useStateContext()
    const {coursetypes, coursecategories} = useCourseContext()
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState()
    const [loading, setLoading] = useState(true)
    const [openEnroll, setOpenEnroll] = useState(false)
    const [duration, setDuration] = useState(false)
    const [enrolling, setEnrolling] = useState()
    const [enrolled, setEnrolled] = useState(false)
    const navigate = useNavigate();
    const {course, setCourse} = useCourse();
    const [search, setSearch] = useState("");
    const [coursesType, setCoursesType] = useState("all");
    const [date, setDate] = React.useState({
        from: new Date(),
        to: undefined,
    });

    useEffect(() => {
        if(search.trim() === ""){
            pageChangeState('currentPage', 1)
            if(coursesType === "all"){
                fetchCourses();
            } else {
                fetchPendingCourses();
            }
            return;
        }

        setLoading(true);
        const handler = setTimeout(() => {
            searchCourses();
        },1000);

        return () => {clearTimeout(handler)};
    },[search]);

    // const [sort, setSort] = useState({
    //     name : "none",
    //     created_at : "none",
    // });
    // const toggleSort = (key,value) => {
    //     setSort((prev => ({
    //         ...prev,
    //         [key]:value,
    //     })));
    // }
    // const setOrder = (key) => {
    //     const order = sort[key] === "none" ? "asc" : sort[key] === "asc" ? "desc" : "none";
    //     toggleSort(key, order);
    // }

    const fetchCourses = () => {
        setLoading(true)
        axiosClient.get('/courses', {
        params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage,
                }
        })
        .then(({ data }) => {
            setCourses(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }

    const fetchPendingCourses = () => {
        setLoading(true)
        axiosClient.get('/getPendingEnrollment',
            {
                params: {
                    page: pageState.currentPage,
                    perPage: pageState.perPage,
                }
            }
        )
        .then(({ data }) => {
            setCourses(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            pageChangeState('currentPage', data.currentPage);
            setLoading(false)
        }).catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }

    const searchCourses = () => {
        setLoading(true)
        axiosClient.get(`/searchSelfEnrollment/${coursesType}`, {
            params: {
                q: search,
                page: pageState.currentPage,
                per_page: pageState.perPage,
            }
        })
        .then(({ data }) => {
            setCourses(data.data)
            pageChangeState("totalCourses", data.total)
            pageChangeState("lastPage", data.lastPage)
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }

    const [pageState, setPagination] = useState({
            currentPage: 1,
            perPage: 12,
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

            useEffect(()=>{
                if(search){
                    searchCourses()
                    return
                }else if(coursesType === "all"){
                    fetchCourses()
                } else {
                    fetchPendingCourses()
                }
            },[pageState.currentPage, pageState.perPage, coursesType])


    //Handle Enrollment
    const handleEnrollment = (course) => {
        setEnrolling(true)
        const payload = [
            {
            userId: user.user_infos.id,
            courseId: course.id,
            enrollerId: user.user_infos.id,
            start_date: format(new Date(date.from), 'yyyy-MM-dd' + ' 00:00:00'),
            end_date: format(new Date(date.to), 'yyyy-MM-dd' + ' 23:59:59')
            }
        ]

        axiosClient.post('enrollments/bulk', payload)
                    .then(({data}) => {
                        setEnrolling(false)
                        setOpenEnroll(false)
                        setDuration(false)
                        setEnrolled(true)
                    })
                    .catch((err)=>console.log(err));
    }



    return(
    <>
        <div className='grid grid-cols-4 grid-rows-[6.25rem_min-content_1fr_min-content] gap-2 h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | Self-Enrollment</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-4 row-span-1 border-b mr-4 py-4 border-divider '>
                <h1 className='text-primary text-4xl font-header'>Self Enrollment</h1>
                <p className='font-text text-sm text-unactive'>View shows all available courses learners can freely enroll in to expand their skills at their own pace.</p>
            </div>

            <div className="py-2 col-start-1">
                <Select value={coursesType} onValueChange={(value)=>{setCoursesType(value)}} disabled={loading}>
                    <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-full py-5 bg-white`}>
                        <SelectValue placeholder="Courses Type" />
                    </SelectTrigger>
                    <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                        <SelectItem value="all" >All Courses</SelectItem>
                        <SelectItem value="pending">Pending Enrollment Courses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="py-2 col-span-2 col-start-3 pr-4">
                <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                    <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                        name='search'
                        value={search}
                        onChange={(e)=>{setSearch(e.target.value)}}
                    />
                    <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                        onClick={() => {if(search){
                            setSearch("")
                        }}}>
                        <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                    </div>
                </div>
            </div>

            <div className="row-start-3 col-span-4 grid grid-cols-4 grid-rows-3 gap-2 mr-4 pb-2">
                {
                    loading ?
                    Array.from({length: 12}).map((item,_)=> (
                        <div kwy={_} className="w-full h-full bg-white rounded-md animate-pulse"></div>
                    ))
                    : courses?.length === 0 ?
                    <div className="col-span-4 row-span-3 flex flex-col items-center justify-center gap-5">
                        <div className="w-36 h-36 bg-primarybg rounded-full flex items-center justify-center text-7xl text-primary">
                            <FontAwesomeIcon icon={faXmark} />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="font-header text-2xl text-primary">No Courses Found</p>
                            <p className="font-text text-xs text-unactive">There is no courses found to be suitable to self enroll of the user</p>
                        </div>
                    </div>
                    :
                    courses?.map((item)=>(
                        <div key={item.id} className="rounded-md h-full w-full relative bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] hover:cursor-pointer hover:shadow-md transition-all ease-in-out overflow-hidden"
                            onClick={() => {navigate(coursesType === 'all' ? `/learner/preview/${item.id}` : `/learner/preview/${item.id}/${item.request_id}`), setCourse(item)}}>
                            <div className={`w-full h-full bg-cover rounded-t-md`}
                                style={{ backgroundImage: `url(${item.image_path})` }}>
                            </div>
                            <div className="absolute bg-gradient-to-t from-black via-black/80 to-transparent w-full h-full rounded-md p-4 flex flex-col justify-between top-0 left-0">
                            <div className="flex flex-row w-full justify-between">
                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{item?.training_type?.charAt(0).toUpperCase()}{item?.training_type?.slice(1)}</span>
                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{item.courseDuration} hours</span>
                            </div>
                                <div className="flex flex-col justify-end">
                                    <h1 className='font-header text-sm text-white'>{item.courseName}</h1>
                                    <p className='font-text text-xs text-white'>{item.courseID} ({item?.categories?.category_name || "Deleted Category"} - {item?.career_level?.name} Level)</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Paganation */}
            <div className="mr-5 col-span-4 row-start-5 row-span-1 flex flex-row justify-between items-center py-3 border-t border-divider">
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
                                loading ? (<a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>...</a>)
                                :
                                (Pages.map((page)=>(
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

        <SelfEnrollmentModal open={openEnroll} onClose={()=>{setOpenEnroll(false)}} course={selectedCourse} setDuration={()=>{setDuration(true)}}/>
        {/* <TraningDurationModal open={duration} close={()=>{setDuration(false)}} enroll={()=>handleEnrollment(selectedCourse)} date={date} _setDate={setDate} course={selectedCourse} enrolling={enrolling}/> */}
        </>
    )
}
