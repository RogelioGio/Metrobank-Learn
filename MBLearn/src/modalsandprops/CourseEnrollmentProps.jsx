import { faCalendar, faChevronLeft, faChevronRight, faCircleXmark, faFilter, faMagnifyingGlass, faRightToBracket, faSearch, faSpinner, faTrash, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import axiosClient from '../axios-client'
import Learner from '../components/Learner'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../components/ui/select';
import { useStateContext } from '../contexts/ContextProvider'
import CourseEnrollmentSuccesfully from './CourseEnrollmentSuccessfullyModal'
import NoEmployeeSelectedModal from './NoEmployeeSelectedModal'
import { useOption } from '../contexts/AddUserOptionProvider'
import { Train } from 'lucide-react'
import TrainingDurationModal from './TrainingDurationModal'
import { format, set } from 'date-fns'
import UserFilterProps from './UserFilterProps'
import { useFormik } from 'formik'
import * as Yup from 'yup';
import { ScrollArea } from '../components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Calendar } from '../components/ui/calendar'
import ConfirmEnrollment from './ConfirmEnrollment'
import ApproveEnrollment from './ApproveEnrollment'
import RejectEnrollment from './RejectEnrollment'
import EnrollmentRejectedSuccessfully from './EnrollmentRejectedSuccessfullyModal copy'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'



const CourseEnrollmentProps = ({course}) => {
    const {user} = useStateContext();

    const [selected, setSelected] = useState([]); //Select learner to ernoll
    const [durationModal, setDurationModal] = useState(false)
    const [results, setResults] = useState([]); //Enrolled results
    const [enrolled, setEnrolled] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [save, setSave] = useState(false) // opens the warning
    const [empty, setEmpty] = useState(false) // opens the warning
    const [processing, setProcessing] = useState(false)
    const [filter, setFilter] = useState(false)
    const [search, setSearch] = useState("")
    const [enrollmentConfirm, setEnrollConfirm] = useState(false)
    const [tab, setTab] = useState("learner");
    const [approve, setApprove] = useState(false);
    const [reject, setReject] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejected, setRejected] = useState(false);
    const {id} = useParams();
    const navigate = useNavigate();

    const [learners, setLearners] = useState([])

    const obeserverRef = useRef(null);
    const sentinelRef = useRef(null);
    const [loadingMore,setLoadingMore] = useState();
    const [learnerLoading, setLearnerLoading] = useState(true)// initial loading state
    const [hasMore, setHasMore] = useState(true);



    useEffect(() => {
        if(learnerLoading) return;
        if(!hasMore) return;

        if(obeserverRef.current) obeserverRef.current.disconnect();

        obeserverRef.current = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                next()
            }
        });

        const current = sentinelRef.current;
        if(current) obeserverRef.current.observe(current);
        return () => {
            if(obeserverRef.current) obeserverRef.current.disconnect();
        };
    }, [hasMore, learnerLoading, loadingMore]);

    const [date, setDate] = useState({
        from: new Date(),
        to: undefined,
    })

    const handleLearnerChange = (courseId) => {
        axiosClient.get(`/index-user-enrollments/${courseId}`,
            {
                params: {
                            page: pageState.currentPage,
                            perPage: pageState.perPage
                        }
            }
            ).then(({data})=>{
                setLearners((prev) => [...prev, ...data.data])
                pageChangeState('total', data.total)
                pageChangeState('lastPage', data.lastPage)

                setLearnerLoading(false)
                console.log({
                    currentPage: pageState.currentPage,
                    lastPage: data.lastPage
                })
                if(pageState.currentPage >= data.lastPage) {
                    console.log("no more data")
                    setHasMore (false);
                }

                setLoadingMore(false)

            }).catch((err)=>{
                console.log(err)
                setLearnerLoading(false)
                toast.error("You are not assigned to this course.")
                navigate('/');
            })
    }

    const searchEnrollees = () => {
        axiosClient.get(`/search-enrollees/${id}`,{
            params: {
                type: tab,
                page: pageState.currentPage,
                perPage: pageState.perPage,
                q: search
            }
        }).then(({data})=>{
                setLearners((prev) => [...prev, ...data.data])
                pageChangeState('total', data.total)
                pageChangeState('lastPage', data.lastPage)

                setLearnerLoading(false)

                if(pageState.currentPage >= data.data.lastPage) {
                    setHasMore (false);
                }

                setLoadingMore(false)
        }).catch((err)=>{
            console.log(err)
            toast.error("You are not assigned to this course.")
            navigate('/');
        })
    }

    const getRequest = () => {
        axiosClient.get(`/select-course-selfenrollment-requests/${id}`,{
            params: {
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        }).then(({data})=>{
                setLearners((prev) => [...prev, ...data.data])
                pageChangeState('total', data.total)
                pageChangeState('lastPage', data.lastPage)

                setLearnerLoading(false)
                console.log(pageState.currentPage, data.lastPage)
                if(pageState.currentPage >= data.lastPage) {
                    setHasMore (false);
                }

                setLoadingMore(false)
        }).catch((err)=>{
            console.log(err)
        })
    }

    const getRetake = () => {
        axiosClient.get(`index-failed-user-enrollments/${id}`,{
            params: {
                page: pageState.currentPage,
                perPage: pageState.perPage,
            }
        }).then(({data})=>{
                setLearners((prev) => [...prev, ...data.data])
                pageChangeState('total', data.total)
                pageChangeState('lastPage', data.lastPage)

                setLearnerLoading(false)

                if(pageState.currentPage >= data.data.lastPage) {
                    setHasMore (false);
                }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const [pageState, setPagination] = useState({
        currentPage: 1,
        perPage: 16,
        total: 0,
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
            pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.total))
        },[pageState.currentPage, pageState.perPage, pageState.total])

        //Next and Previous
        const back = () => {
            if (learnerLoading) return;
            if (pageState.currentPage > 1){
                pageChangeState("currentPage", pageState.currentPage - 1)
                pageChangeState("startNumber", pageState.perPage - 4)
            }
        }
        const next = () => {
            // if (learnerLoading) return;
            // if (pageState.currentPage < pageState.lastPage){
            //     pageChangeState("currentPage", pageState.currentPage + 1)
            // }
            if (loadingMore || !hasMore) return;
            setLoadingMore(true)
            setPagination((prev) => ({
            ...prev,
            currentPage: prev.currentPage + 1
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


        const pageChange = (page) => {
            if(learnerLoading) return;
            if(page > 0 && page <= pageState.lastPage){
                pageChangeState("currentPage", page)
            }
        }

        useEffect(() => {
            setHasMore(true);
            pageChangeState('currentPage', 1);

            // Optionally clear old results for smoother UX
            if (search.trim() !== "") {
                setLearners([])
                setLearnerLoading(true);
            }

            setLearnerLoading(true); // trigger smooth transition
        }, [search, tab, id]);


        useEffect(() => {
            const handler = setTimeout(() => {
                if (search.trim() === "") {
                    // --- Normal (no search) mode ---
                    if (tab === "learner") {
                        handleLearnerChange(id);
                    } else if (tab === "request") {
                        getRequest();
                    } else if (tab === "retake") {
                        getRetake();
                    }
                } else {
                    // --- Search mode ---
                    searchEnrollees();
                }
            }, 500); // shorter debounce for responsiveness

            // Prevent overlapping timeouts
            return () => clearTimeout(handler);
        }, [search, pageState.currentPage, id, tab]);


        const handleSelectAll = () => {
            if(learnerLoading || learners.length === 0) return
            const all = learners.map((entry)=> (entry));
            setSelected(all);
        }

        // Handle Enrollment
        const handleCheckbox = (User, course) => {
            setSelected((prevUsers) => {
                if(!User&&!course) return

                const exists = prevUsers.some(
                    (entry) => entry.userId === User.id && entry.courseId === id
                );

                if(exists){
                    return prevUsers.filter(
                        (entry) => !(entry.userId === User.id && entry.courseId === id )
                    )
                }else{
                    return [...prevUsers, {userId: User.id, courseId: id, enrollerId: user.user_infos.id }]
                }
            })
            setResults((prev) => {
                if(!User&&!course) return prev;

                const exist = prev.some(
                    (entry) => entry.id === User.id
                );

                if(exist){
                    return prev.filter(
                        (entry) => entry.id !== User.id
                    )
                }else{
                    return [...prev, User]
                }

                // const updated = [...prevCourses];
                // const existingCourse = updated.findIndex(
                //     (c) => c.id === id
                // );

                // if(existingCourse !== -1){
                //     const courseToUpdate = { ...updated[existingCourse] }
                //     courseToUpdate.enrollees = courseToUpdate.enrollees || [];
                //     const enrolled = existingCourse.enrollees?.some(
                //         (u) => u.id === User.id
                //     );

                //     if(!enrolled){
                //         courseToUpdate.enrollees.push(User);
                //     }

                //     updated[existingCourse] = courseToUpdate;
                // } else {
                //     updated.push({
                //         course: course,
                //         enrollees: [User]
                //     });
                // }
                // return updated;

            });
        }
        const handleEnrollment  = () => {
            setEnrolling(true)
            setSave(false)
            if(selected.length <= 0){
                setEmpty(true)
                return
            }
            setDurationModal(true)
        }




        const close = () => {
            setEnrolled(false)
            setTab("learner")
            handleLearnerChange(id)
            setTimeout(()=>{
                setSelected([])
                setResults([])
            },1000)
        }

        // const closeEnrolling = () => {
        //     setSelected([])
        //     setResults([])
        //     setEnrolling(false)
        //     setDurationModal(false)
        //     setDate({
        //         from: new Date(),
        //         to: undefined,
        //     });
        // }

        const handleEnrolling = () => {
            setEnrolling(true);
            const payload = selected.map((item) => (
            {
                userId: item.id,
                courseId: id,
                enrollerId: user.user_infos.id,
                start_date: date.from ? format(new Date(date.from), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                end_date: date.to ? format(new Date(date.to), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss")
            }));

            axiosClient.post('enrollments/bulk', payload)
            .then(({data}) => {
                setEnrolling(false)
                setDurationModal(false)
                setEnrolled(true);
                console.log(data)
            })
            .catch((err)=>console.log(err));
            // setTimeout(()=>{
            //     setEnrolling(false)
            //     setDurationModal(false)
            //     setEnrolled(true)
            // },5000)
        }
        const handleApprove = (status) => {
            const payload = {
                status: status,
                list: selected.map((item)=>(
                    {
                        request_id: item.request_id,
                        // userId: item.id,
                        // courseId: id,
                        // enrollerId: user.user_infos.id,
                        start_date: date.from ? format(new Date(date.from), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                        end_date: date.to ? format(new Date(date.to), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss")

                    }
                ))
            }
                if(status === "approved")
                {
                    setEnrolling(true);
                } else {
                    setRejecting(true);
                }

            axiosClient.post('/enrollments/self/approval', payload)
            .then(({data}) => {
                    if(status === "approved")
                    {
                        setEnrolled(true);
                        setEnrolling(false);
                    } else {
                        setRejected(true);
                        setRejecting(false);
                    }
            })
            .catch((err) => {console.log(err)})

            // setTimeout(()=>{
            //     if(status === "approved")
            //         {
            //             setEnrolled(true);
            //             setEnrolling(false);
            //         } else {
            //             setRejected(true);
            //             setRejecting(false);
            //         }
            // },1000)

            // console.log(payload);
        }

        const filterformik = useFormik({
            initialValues: {
                division: '',
                department: '',
                section: '',
                branch: '',
                city:'',
                title:'',
                careerLevel:'',
            },
            validationSchema: Yup.object({
                department: Yup.string(),
                city: Yup.string(),
                branch: Yup.string(),
            }),
            onSubmit: values => {
                console.log(values)
                // setLoading(true)
                // setIsFiltered(true); // Set to true when filtered
                // axiosClient.get(`/index-user?division_id[eq]=${values.division}&department_id[eq]=${values.department}&section_id[eq]=${values.section}&branch_id[eq]=${values.branch}`)
                // .then((res) => {
                //     setUsers(res.data.data);
                //     setLoading(false)
                // }).catch((err) => {console.log(err)})
            }
        })


        // useEffect(() => {console.log(selected)},[selected])\

        const learnersToEnroll = (learner) => {
            setSelected((prev) => {
                const existed = prev.some(item => item.id === learner.id)

                if(existed){
                    return prev.filter(item => item.id !== learner.id)
                } else {
                    return [...prev, learner]
                }
            })
        }

    return(
        <>
        <div className='grid grid-rows-[min-content_1fr_min-content] grid-cols-4 h-full gap-2 pt-4'>
            <div className='inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md col-start-3'>
                        <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'
                            name='search'
                            value={search}
                            onChange={(e)=>{setSearch(e.target.value)}}
                        />
                <div className={`min-w-11 min-h-10 bg-primary text-white flex items-center justify-center ${search ? "hover:cursor-pointer":null}`}
                    onClick={() => {
                        if(search){
                        setSearch("")
                        handleLearnerChange(id)
                    }}}>
                    <FontAwesomeIcon icon={search ? faXmark : faMagnifyingGlass}/>
                </div>
            </div>
            <div className='col-start-1 row-start-1'>
                <div className='w-full h-full'>
                    <Select value={tab} onValueChange={(value)=>{setTab(value), setLearners([]), setSelected([])}} disabled={learnerLoading} className>
                        <SelectTrigger className="focus:outline-2 focus:-outline-offset-2 focus:outline-primary bg-white border-primary border-2 font-header text-primary w-full h-full">
                            <SelectValue placeholder="Learners" />
                        </SelectTrigger>
                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            <SelectItem value="learner">Learner List</SelectItem>
                            <SelectItem value="request">Self-Enrollment Request</SelectItem>
                            <SelectItem value="retake">Subject for Retake</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Learner */}
            <div className='col-span-3 flex flex-col justify-between gap-2 pb-2'>
                <ScrollArea className="bg-white w-full h-[calc(100vh-14rem)] rounded-md border-divider border">
                    <div className='flex flex-col gap-2 p-4'>
                        {
                            learnerLoading ?
                            Array.from({length: 12}).map((i,_)=>(
                                <div key={_} className='animate-pulse border-divider border w-full rounded-md bg-white flex flex-col p-4 h-20 shadow-md'/>
                            )) :
                            learners.length === 0  ?
                            <div className=' flex items-center justify-center flex-col gap-2 h-[26.9rem]'>
                                <div className='w-24 h-24 rounded-full bg-primarybg flex justify-center items-center'>
                                    <FontAwesomeIcon icon={faXmark} className='text-primary text-5xl'/>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <p className='font-header text-2xl text-primary'>No Learner Found</p>
                                    <p className='font-text text-xs text-unactive'>There is no learner found within the given criteria</p>
                                </div>
                            </div>
                            :
                            <>
                                {
                                learners.map((learner, index) => (
                                    <div className={`border p-4 grid grid-cols-[1fr_1fr_1fr_1fr] bg-white border-divider rounded-md gap-2 hover:cursor-pointer hover:border-primary ${selected.some(i => i.id === learner.id)? "border-primary shadow-sm":"border-divider"} transition-all ease-in-out`}
                                        onClick={()=>{learnersToEnroll(learner)}}>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                                <img src={learner.profile_image} alt="" />
                                            </div>
                                            <div className='leading-tight'>
                                                <p className='text-xs font-text text-primary'>{learner.first_name} {learner.middle_name || ""} {learner.last_name}</p>
                                                <p className='text-xs font-text text-unactive'>ID: {learner.employeeID}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className='font-text text-primary text-xs'>{learner?.title?.department?.division.division_name}</p>
                                            <p className='font-text text-xs text-unactive'>Division</p>
                                        </div>
                                        <div>
                                            <p className='font-text text-primary text-xs'>{learner?.title.department.department_name}</p>
                                            <p className='font-text text-xs text-unactive'>Department</p>
                                        </div>
                                        <div>
                                            <p className='font-text text-primary text-xs'>{learner?.title.title_name}</p>
                                            <p className='font-text text-xs text-unactive'>Role</p>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className='flex items-center justify-center p-4 text-xs text-unactive' ref={sentinelRef}>
                                {
                                    hasMore?
                                    <p><FontAwesomeIcon icon={faSpinner} className='animate-spin mr-3'/> Loading entries</p>
                                    :
                                    <p>
                                        {`---Display ${pageState.total} all entries with the given criteria---`}
                                    </p>
                                }
                            </div>
                            </>
                        }
                    </div>
                </ScrollArea>

                <div className="flex flex-row gap-2 items-center">
                    <div className='flex flex-row gap-2 items-center '>
                        <div className={`text-white px-4 w-fit h-9 bg-primary flex gap-2 items-center justify-center rounded-md hover:cursor-pointer hover:text-white hover:bg-primaryhover transition-all ease-in-out ${learnerLoading ? "opacity-50" : null}`}
                            onClick={()=>{
                                if(learnerLoading) return;
                                handleSelectAll()
                            }}>
                            <FontAwesomeIcon icon={faRightToBracket} />
                            <p>Select All</p>
                        </div>
                    </div>
                    <p className='text-sm font-text text-primary'>
                        {selected.length} selected entries
                    </p>
                    <p className='text-sm font-text text-unactive hover:cursor-pointer hover:underline' onClick={()=>{setSelected([])}}>
                        Clear all
                    </p>
                </div>

            </div>

            {/* List of enrollees */}
            {/* ${enrolling || rejecting ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:cursor-pointer"} */}
            <div className='flex flex-col gap-2 row-span-3 row-start-1 col-start-4'>
                <div className='flex flex-row gap-2'>
                    <div className={`font-header bg-primary w-full h-fit py-3 rounded-md flex items-center justify-center text-white  transition-all ease-in-out ${(selected.length === 0 || !date.to || !date.from) ? "opacity-50 cursor-not-allowed" : tab === "request" & selected.length === 0 ? "opacity-50 cursor-not-allowed" : enrolling  || rejecting ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:cursor-pointer"}`}
                        onClick={()=>{
                            if(tab === "request" && !enrolling && !rejecting && selected.length > 0){
                                // handleApprove("approved")
                                setApprove(true)
                                return;
                            }
                            if(selected.length === 0 || !date.to || !date.from) return
                            setEnrollConfirm(true)
                        }}>
                            {
                                enrolling ?
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2'/>
                                    <p>Enrolling</p>
                                </> : <>
                                    <FontAwesomeIcon icon={faUserPlus} className='mr-2'/>
                                    <p>Enroll</p>
                                </>
                            }
                    </div>
                    {
                        tab === "request" ?
                        <div className={`font-header bg-white border-2 border-primary text-primary w-full h-fit py-3 rounded-md flex items-center justify-center transition-all ease-in-out ${selected.length === 0 ? "opacity-50 cursor-not-allowed" : enrolling  || rejecting ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:cursor-pointer hover:text-white "}`}
                            onClick={()=>{
                                if(selected.length === 0) return
                                if(tab === "request" && !enrolling && !rejecting){
                                    //handleApprove("reject")
                                    setReject(true)
                                    return;
                                }
                            }}>
                            {
                                rejecting ?
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2'/>
                                    <p>Rejecting</p>
                                </> : <>
                                    <FontAwesomeIcon icon={faCircleXmark} className='mr-2'/>
                                    <p>Reject</p>
                                </>
                            }

                        </div> : null
                    }
                </div>
                {
                    tab === "learner" || tab === "retake" || tab === "request"?
                    <div className='flex flex-row justify-between items-center'>
                        <div className='flex flex-row w-full gap-2'>
                            <div className='w-full'>
                                <p className='text-xs text-unactive font-text'>Starting Date:</p>
                                {
                                    date.from ?
                                    <p className='text-base font-header text-primary'>
                                        {format(date.from, "MMM dd yyyy")}
                                    </p>
                                    :
                                    <p className='text-xs font-text text-unactive italic'>Select date</p>
                                }
                            </div>
                            <div className='w-full'>
                                <p className='text-xs text-unactive font-text'>Ending Date:</p>
                                {
                                    date.to ?
                                    <p className='text-base font-header text-primary'>
                                        {format(date.to, "MMM dd yyyy")}
                                    </p>
                                    :
                                    <p className='text-xs font-text text-unactive italic'>Select date</p>
                                }
                            </div>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="w-10 h-10 border-2 flex flex-row items-center font-text border-primary bg-white justify-center text-primary rounded-md py-2 px-4 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out">
                                    <FontAwesomeIcon icon={faCalendar}/>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className='w-fit'>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date.from}
                                    selected={date}
                                    onSelect={(range) => setDate(range ?? { from: undefined, to: undefined })}
                                    disabled={{ before: new Date() }}
                                    numberOfMonths={2}
                                    fromDate={new Date()}
                                    toDate={new Date().setFullYear(new Date().getFullYear() + 2)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div> :
                    <div className={`font-header bg-white border-2 border-primary text-primary w-full h-fit py-3 rounded-md flex items-center justify-center transition-all ease-in-out ${selected.length === 0 ? "opacity-50 cursor-not-allowed" : enrolling  || rejecting ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover hover:cursor-pointer hover:text-white "}`}
                        onClick={()=>{
                            if(selected.length === 0) return
                            if(tab === "request" && !enrolling && !rejecting){
                                //handleApprove("reject")
                                setReject(true)
                                return;
                            }
                        }}>
                        {
                            rejecting ?
                            <>
                                <FontAwesomeIcon icon={faSpinner} className='animate-spin mr-2'/>
                                <p>Rejecting Learner</p>
                            </> : <>
                                <FontAwesomeIcon icon={faCircleXmark} className='mr-2'/>
                                <p>Reject Enrollments</p>
                            </>
                        }

                    </div>
                    }
                <p className='font-text text-xs text-unactive'>Selected Learner:</p>
                <ScrollArea className={`w-full ${tab === "learner" ? "h-[calc(100vh-15rem)]" : "h-[calc(100vh-15.8rem)]"}  col-span-3 bg-white border border-divider rounded-md`}>
                    <div className='p-4 flex flex-col gap-2'>
                        {
                            selected.length === 0 ?
                            <div className='h-[calc(100vh-17rem)] flex flex-col items-center justify-center gap-2'>
                                <div className='h-28 w-28 bg-primarybg rounded-full justify-center items-center text-4xl text-primary flex'>
                                    <FontAwesomeIcon icon={faUserPlus}/>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <p className='font-header text-xl text-primary'>No Learner Selected</p>
                                    <p className='font-text text-xs text-unactive'>Select Learner to enroll</p>
                                </div>
                            </div>
                            : selected.map((selected, index) => (
                                <div key={index} className='w-full border-divider border p-4 bg-white shadow-sm rounded-md flex flex-row justify-between'>
                                    <div className='gap-2 flex flex-col'>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                                <img src={selected.profile_image} alt="" />
                                            </div>
                                            <div className='leading-tight'>
                                                <p className='text-xs font-text text-primary'>{selected.first_name} {selected.middle_name || ""} {selected.last_name}</p>
                                                <p className='text-xs font-text text-unactive'>ID: {selected.employeeID}</p>
                                            </div>
                                        </div>
                                        <p className='text-xs font-text text-unactive'>{selected?.title?.title_name}</p>
                                    </div>
                                    <div>
                                        <FontAwesomeIcon icon={faXmark} onClick={()=>{learnersToEnroll(selected)}} className='font-text text-sm text-unactive hover:cursor-pointer hover:text-primary'/>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </ScrollArea>
            </div>

            {/* Pagination */}

        </div>

        {
            !course ? null :
            <>
                {/* Training Duration */}
                {/* <TrainingDurationModal open={durationModal} close={()=>{setDurationModal(false),setEnrolling(false)}} enroll={handleEnrolling} date={date} _setDate={setDate} course={course} enrolling={processing} save={save}/> */}
                {/* Successfully */}
                <CourseEnrollmentSuccesfully open={enrolled} close={close} result={results} course={course} duration={date} learner={selected} date={date} tab={tab}/>
                <EnrollmentRejectedSuccessfully open={rejected} close={()=>{setRejected(false); setTab("learner"); setSelected([])}} course={course} learner={selected} />
                {/* Empty */}
                <NoEmployeeSelectedModal isOpen={empty} onClose={()=>{setEmpty(false),setEnrolling(false)}} />
                <ConfirmEnrollment open={enrollmentConfirm} close={()=>{setEnrollConfirm(false)}} course={course} date={date} learner={selected} handleEnrollment={()=>{handleEnrolling(); setEnrollConfirm(false)}}/>
                <ApproveEnrollment open={approve} close={()=>{setApprove(false)}} course={course} learner={selected} handleEnrollment={()=>{handleApprove("approved"); setApprove(false)}}/>
                <RejectEnrollment open={reject} close={()=>{setReject(false)}} course={course} learner={selected} handleReject={()=>{handleApprove("rejected"); setReject(false)}}/>
            </>

        }
        </>
    )
}
export default CourseEnrollmentProps


const backUp = () => {
    <>
     {
                    learnerLoading ?
                    Array.from({length: 16}).map((i,_)=>(
                        <div key={_} className='animate-pulse border-divider border w-full h-full rounded-md bg-white flex flex-col p-4'/>
                    ))
                    : learners.length === 0 ?
                    <div className='col-span-4 row-span-4 flex items-center justify-center flex-col gap-2'>
                        <div className='w-24 h-24 rounded-full bg-primarybg flex justify-center items-center'>
                            <FontAwesomeIcon icon={faXmark} className='text-primary text-5xl'/>
                        </div>
                        <div className='flex flex-col items-center'>
                            <p className='font-header text-2xl text-primary'>No Learner Found</p>
                            <p className='font-text text-xs text-unactive'>There is no learner found within the give criteria</p>
                        </div>
                    </div>
                    : learners.map((learner, index) => (
                        <div key={index} className={`border w-full h-full rounded-md bg-white hover:border-primary hover:cursor-pointer transition-all ease-in-out flex flex-col gap-2 p-3 ${selected.some(i => i.id === learner.id)? "border-primary shadow-sm":"border-divider"}`}
                            onClick={()=>{learnersToEnroll(learner)}}>
                            <div className='flex flex-row gap-2 h-full items-center'>
                                <div className='w-8 h-8 min-h-8 min-w-8 bg-primary rounded-full overflow-hidden'>
                                    <img src={learner.profile_image} alt="" />
                                </div>
                                <div className='leading-tight'>
                                    <p className='text-xs font-text text-primary'>{learner.first_name} {learner.middle_name || ""} {learner.last_name}</p>
                                    <p className='text-xs font-text text-unactive'>ID: {learner.employeeID}</p>
                                </div>
                            </div>
                            <p className='text-xs font-text text-unactive'>{learner.title?.title_name || null}</p>
                        </div>
                    ))
                }
    <div className="col-span-3 h-full flex flex-row items-center justify-between py-3 pl-3 md:pl-0">
                <div>
                    {
                        learnerLoading ? <p className='text-sm font-text text-unactive'>
                        Retrieving Learner to be enrolled...
                        </p> :
                        learners.length === 0 ?
                        <p className='text-sm font-text text-unactive'>
                            No Learner Found
                        </p> :
                        <p className='text-sm font-text text-unactive'>
                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.total}</span> <span className='text-primary'>results</span>
                        </p>
                    }
                </div>
                    <div>
                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                            {/* Previous */}
                            <a
                                onClick={back}
                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer'>
                                <FontAwesomeIcon icon={faChevronLeft}/>
                            </a>

                            {/* Current Page & Dynamic Paging */}
                            {
                                Pages.map((page)=>(
                                        <a
                                            key={page}
                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                ${
                                                    page === pageState.currentPage
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                } ${learnerLoading ? "opacity-50" : null} transition-all ease-in-out cursor-pointer`}
                                                onClick={() => pageChange(page)}>
                                            {page}</a>
                                    ))
                            }
                            <a
                                onClick={next}
                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out hover:cursor-pointer'>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </a>
                        </nav>
                    </div>
            </div></>
}
