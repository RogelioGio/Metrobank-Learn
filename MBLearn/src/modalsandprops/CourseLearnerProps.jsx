import { faAward, faBookOpen, faCheckCircle, faChevronLeft, faChevronRight, faExclamationTriangle, faFilter, faGraduationCap, faMagnifyingGlass, faPlus, faSearch, faSpider, faSpinner, faUser, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import axiosClient from '../axios-client';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../components/ui/select';
import { format } from 'date-fns';
import CourseLearnerDetailsModal from './CourseLearnerDetailsModal';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer';
import CourseEnrollmentProps from './CourseEnrollmentProps';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import ResetUserProgressModal from './ResetUserProgressModal';


const CourseLearnerProps = ({course}) => {
    const navigate = useNavigate();


    const {id} = useParams();
    const stat = {
        progress: 50, // Progress in percentage
        color: "white", // Color of the progress ring
    };
    // Tab
    const [tab, setTab] = useState("enrolled");
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDetails, setOpenDetails] = useState(false)
    const [select, setSelected] = useState({})
    const [openReset, setOpenReset] = useState(false);
    const [search,setSearch] = useState("");

    const fetchLearners = (endpoint) => {
        setLoading(true);
        axiosClient.get(`/select-course-users/${id}?enrollment_status[eq]=${endpoint}`,
            {
            params: {
                page: pageState.currentPage,
                per_page: pageState.perPage,
            }
        }
        )
        .then((res) => {
            setLoading(false);
            setLearners(res.data.data.data);
            pageChangeState("totalUsers", res.data.total)
            pageChangeState("lastPage", res.data.lastPage)
        }).catch((err) => {
            console.log(err)
            toast.error("You are not assigned in this course.");
            navigate("/");
        })
    }

    const searchLearner = () => {
        setLoading(true);
        axiosClient.get(`/search-CourseLearner/${id}`,{
            params: {
                q: search,
                status: tab,
                page: pageState.currentPage,
                per_page: pageState.perPage,
            }
        }).then((res)=>{
            setLoading(false);
            setLearners(res.data.data);
            pageChangeState("totalUsers", res.data.total)
            pageChangeState("lastPage", res.data.lastPage)
        })
    }

    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 12,
        totalUsers: 0,
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

    useEffect(() => {
        pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
        pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.totalUsers))
    },[pageState.currentPage, pageState.perPage, pageState.totalUsers])

    useEffect(() => {
        if (loading) return;

        const handler = setTimeout(() => {
            if (search.trim() === "") {
                // Empty search: normal list fetch
                fetchLearners(tab);
            } else {
                // With search text: perform search
                searchLearner();
            }
        }, 800); // debounce for smoother UX

        return () => clearTimeout(handler);
    }, [
        search,
        pageState.currentPage,
        pageState.perPage,
        tab
    ]);



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

    //Current page change
    const pageChange = (page) => {
        if(loading) return;
        if(page > 0 && page <= pageState.lastPage){
            pageChangeState("currentPage", page)
        }
    }




    return(
        <>
            <div className='grid grid-rows-[min-content_1fr_min-content] grid-cols-4 h-full px-4
                            md:pr-2 md:px-0'>
                {/* Headers */}
                <div className='flex flex-row gap-2 col-span-1 items-center'>
                    {/* <Drawer>
                        <DrawerTrigger asChild>
                            <div className='min-w-10 min-h-10 w-10 h-10 border-2 rounded-md border-primary bg-primary text-xl flex flex-col items-center justify-center hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out'>
                                <FontAwesomeIcon icon={faPlus} className='text-white'/>
                            </div>
                        </DrawerTrigger>
                        <DrawerContent className="h-[100%] p-4">
                            <DrawerClose className='absolute right-4 top-4'>
                                <div className='w-8 h-8 border border-primary rounded-full flex justify-center items-center text-primary hover:text-white hover:bg-primary transition-all ease-in-out'>
                                    <FontAwesomeIcon icon={faXmark} />
                                </div>
                            </DrawerClose>
                            <DrawerHeader>
                                <DrawerTitle className="font-header text-2xl text-primary">Enroll Learner</DrawerTitle>
                                <DrawerDescription className="font-text text-xs">Select desired learner to enroll to the given course</DrawerDescription>
                            </DrawerHeader>
                            <CourseEnrollmentProps course={course}/>
                        </DrawerContent>
                    </Drawer> */}
                    <div className='w-full'>
                    <Select value={tab} onValueChange={setTab} disabled={loading} className>
                        <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary bg-white border-primary border-2 font-header text-primary w-full h-full">
                            <SelectValue placeholder="Learner Status" />
                        </SelectTrigger>
                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            <SelectItem value="enrolled">Enrolled</SelectItem>
                            <SelectItem value="ongoing">On-Going</SelectItem>
                            <SelectItem value="pastdue">Past-Due</SelectItem>
                            <SelectItem value="finished">Finished</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>

                        </SelectContent>
                    </Select>
                    </div>
                </div>
                {/* <div className='md:col-start-3 col-start-2 flex justify-end items-center py-2 '>
                    <div className='w-10 h-10 bg-white border-2 border-primary rounded-md shadow-md flex items-center justify-center hover:cursor-pointer text-primary hover:bg-primary hover:text-white transition-all ease-in-out'>
                        <FontAwesomeIcon icon={faFilter} className='text-lg'/>
                    </div>
                </div> */}
                <div className='py-2 col-span-2 col-start-3'>
                    <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name='search'
                            value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                        />
                        <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                            onClick={() => {if(search){
                                setSearch("")
                                fetchLearners(tab)
                            }}}>
                            <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                        </div>
                    </div>
                </div>

                {/* content */}
                <div className='col-span-4 h-full border-divider border rounded-md bg-white overflow-hidden p-4 grid grid-cols-4 grid-rows-3 gap-2'>
                    {
                        loading ? <>
                        {
                            Array.from({length: 12}).map((i, _)=>(
                                <div key={_} className='border border-divider rounded-sm bg-white shadow-md p-4 flex flex-col h-full w-full animate-pulse'></div>
                            ))
                        }
                        </> :
                        learners.length === 0 ?
                        <div className='col-span-4 row-span-3 h-full flex flex-col justify-center items-center'>
                            <div className='flex flex-col items-center justify-center bg-primarybg min-w-32 min-h-32 rounded-full text-primary'>
                                <FontAwesomeIcon icon={faXmark} className='text-7xl'/>
                            </div>
                            <div className='flex flex-col items-center mt-4'>
                                <p className='font-header text-xl text-primary'>No Learner Found</p>
                                <p className='font-text text-xs text-unactive'>There are no learner with the current enrollment status</p>
                            </div>
                        </div>
                        : learners.map((learner)=>(
                            <div className='border border-divider rounded-sm bg-white shadow-md p-4 gap-1 flex flex-col h-full w-full hover:cursor-pointer hover:border-primary transition-all ease-in-out'
                                onClick={()=>{
                                    if(tab === "finished" && "failed") {
                                        setOpenReset(true);
                                        setSelected(learner)
                                        return;
                                    }
                                    setOpenDetails(true),
                                    setSelected(learner)}}>
                                <div className='flex flex-row gap-2 items-center h-full'>
                                    <div>
                                        {/* image */}
                                        <div className='min-w-8 min-h-8 w-8 h-8 bg-primarybg text-primary rounded-full flex items-center justify-center'>
                                            <img src={learner.enrolled_user.profile_image} alt="" className='rounded-full'/>
                                        </div>
                                    </div>
                                        <div className='w-full'>
                                            <p className='font-header text-sm'>{learner.enrolled_user.first_name} {learner.enrolled_user.middle_name||""} {learner.enrolled_user.last_name}</p>
                                            <p className='font-text text-xs text-unactive'>ID:{learner.enrolled_user.employeeID}</p>
                                        </div>
                                </div>
                                <div className='h-full flex flex-row items-center justify-between w-full'>
                                    {
                                        tab === "enrolled" ?
                                        <>
                                        <div className='w-full'>
                                            <p className='text-xs font-text text-unactive'>Enrollment</p>
                                            <p className='font-text text-sm'>{format(new Date(learner.start_date),"MMM dd yyyy")}</p>
                                        </div>
                                        <div className='w-full'>
                                            <p className='text-xs font-text text-unactive'>Due Date</p>
                                            <p className='font-text text-sm'>{format(new Date(learner.end_date),"MMM dd yyyy")}</p>
                                        </div>
                                        </> : tab === "ongoing" ?
                                        <>
                                        <div className='w-full'>
                                            <p className='text-xs font-text text-unactive'>Due Date</p>
                                            <p className='font-text text-sm'>{format(new Date(learner.end_date),"MMM dd yyyy")}</p>
                                        </div>
                                        <div className='flex flex-row  justify-end gap-2 items-center w-full'>
                                            <div className='flex flex-col items-end leading-none'>
                                                <p className='text-sm'>{learner.completed_percentage}%</p>
                                                <p className='text-xs font-text text-unactive'>Progress</p>
                                            </div>
                                            <RingProgress
                                                size={40} // Diameter of the ring
                                                roundCaps
                                                thickness={5} // Thickness of the progress bar
                                                sections={[{ value: learner.completed_percentage, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                                rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            />
                                        </div>
                                        </>
                                        : tab === "pastdue" ?
                                        <>
                                        {
                                            learner.enrollment_status === "enrolled" ?
                                            <div className='flex flex-row gap-1 px-2 py-1 bg-red-400 text-red-800 border-red-600 border rounded-md w-fit text-xs items-center whitespace-nowrap'>
                                                <FontAwesomeIcon icon={faXmarkCircle}/>
                                                <p>Not Started</p>
                                            </div>
                                            : learner.enrollment_status === "ongoing" ?
                                            <div className='flex flex-row gap-1 px-2 py-1 bg-yellow-200 text-yellow-800 border-yellow-600 border rounded-md w-fit text-xs items-center whitespace-nowrap'>
                                                <FontAwesomeIcon icon={faExclamationTriangle}/>
                                                <p>Past Deadline</p>
                                            </div> : null
                                        }
                                        <div className='flex flex-row  justify-end gap-2 items-center w-full'>
                                            <div className='flex flex-col items-end leading-none'>
                                                <p className='text-sm'>{learner.completed_percentage}%</p>
                                                <p className='text-xs font-text'> Progress</p>
                                            </div>
                                            <RingProgress
                                                size={50} // Diameter of the ring
                                                roundCaps
                                                thickness={8} // Thickness of the progress bar
                                                sections={[{ value: learner.completed_percentage, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                                rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            />
                                            </div>
                                        </>
                                        : tab === "finished" ?
                                        <div className='flex flex-row gap-2 w-full justify-end items-center'>
                                            <div className='flex flex-col items-end leading-none'>
                                                <p className='text-xs text-unactive'>Completion Date:</p>
                                                <p className='text-sm font-text'>{learner.updated_at ? format(new Date(learner.updated_at),"MMM dd yyyy") : null}</p>
                                            </div>
                                            <FontAwesomeIcon icon={faCheckCircle} className='text-3xl text-primary'/>
                                        </div>
                                        // <div className='flex flex-row gap-1 px-2 py-1 bg-green-200 text-green-800 border-green-600 border rounded-md w-fit text-xs items-center whitespace-nowrap'>
                                        //     <FontAwesomeIcon icon={faCheckCircle}/>
                                        //     <p>Completed on {learner.updated_at ? format(new Date(learner.updated_at),"MMM dd yyyy") : null}</p>
                                        // </div>
                                        : tab === "failed" ?
                                        <div className='flex flex-row gap-2 w-full justify-end items-center'>
                                            <div className='flex flex-col items-end leading-none'>
                                                <p className='text-xs text-unactive'>Completion Date:</p>
                                                <p className='text-sm font-text'>{learner.updated_at ? format(new Date(learner.updated_at),"MMM dd yyyy") : null}</p>
                                            </div>
                                            <FontAwesomeIcon icon={faXmark} className='text-3xl text-primary'/>
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Paginate */}
                <div className='flex flex-row items-center justify-between col-span-4 py-4'>
                    {
                        loading ?
                        <div className='text-unactive flex flex-row'>
                            <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2' />
                            <p className='font-text text-xs'>Loading Entries</p>
                        </div>
                        : learners.length === 0 ?
                        <p className='font-text text-xs'>No Learner found</p>
                        : <p className='text-sm font-text text-unactive'>
                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.totalUsers}</span> <span className='text-primary'>results</span>
                        </p>
                    }
                    {/* Paganation */}
                    <div>
                        <nav className={`isolate inline-flex -space-x-px round-md shadow-xs`}>
                            {/* Previous */}
                            <a
                                onClick={back}
                                className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${loading ? "cursor-not-allowed opacity-50":"hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </a>

                            {/* Current Page & Dynamic Paging */}
                            {Pages.map((page)=>(
                                <a
                                    key={page}
                                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                        ${loading ? "cursor-not-allowed opacity-50" : "hover:bg-primary hover:text-white hover:cursor-pointer"}
                                        ${
                                            page === pageState.currentPage
                                            ? 'bg-primary text-white'
                                            : 'bg-secondarybackground text-primary '
                                        } transition-all ease-in-out`}
                                        onClick={() => pageChange(page)}>
                                    {page}</a>
                            ))}
                            <a
                                onClick={next}
                                className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset transition-all ease-in-out ${loading ? "cursor-not-allowed opacity-50":"hover:bg-primary hover:text-white hover:cursor-pointer"}`}>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>

            <CourseLearnerDetailsModal open={openDetails} close={()=>{setOpenDetails(false)}} learner={select} fetchUser={()=>{fetchLearners(tab)}}/>
            <ResetUserProgressModal open={openReset} close={()=>{setOpenReset(false)}} learner={select} course={course}/>
        </>
    )
}
export default CourseLearnerProps
