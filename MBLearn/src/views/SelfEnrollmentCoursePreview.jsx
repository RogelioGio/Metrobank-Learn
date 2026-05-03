import axios from "axios";
import { useCourse } from "../contexts/Course"
import axiosClient from "../axios-client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookBookmark, faCalendar, faClipboard, faFile, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ScrollArea } from "../components/ui/scroll-area";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Calendar } from '../components/ui/calendar'
import { useStateContext } from "../contexts/ContextProvider";
import SelfEnrollmentSuccessfullyModal from "../modalsandprops/SelfEnrollmentSuccessfullyModal";
import SelfEnrollmentCourseConfirmation from "../modalsandprops/SelfEnrollmentConfirmation";


export default function SelfEnrollmentCoursePreview() {
    const {course,setCourse} = useCourse();
    const {id, request} = useParams();
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const {user} = useStateContext()
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState(false);

    const [date, setDate] = useState({
        from: undefined,
        to: undefined,
    })

    const getCourse = () => {
        if(course) return
        axiosClient.get(`/coursecontext/${id}`)
        .then((res) => {
            console.log(res.data);
            setCourse(res.data)
        })
        .catch((e) => console.log(e))
    }

    const getRequest = () => {
        if(course) return
        axiosClient.get(`/getRequestCourse/${request}`)
        .then(({data}) => {
            setCourse(data)
        })
        .catch((e) => console.log(e))
    }

    useEffect(()=>{
        if(course) return
        if(request) {
            getRequest()
        } else {
            getCourse()
        }
    },[course])

    const handleEnrollment = () => {
        const payload = [{
            userId: user.user_infos.id,
            courseId: course.id,
            enrollerId: user.user_infos.id,
            start_date: date.from ? format(new Date(date.from), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            end_date: date.to ? format(new Date(date.to), "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss")
        }]

        setEnrolling(true)

        axiosClient.post('/enrollments/self/bulk', payload)
        .then(({data}) => {
            setEnrolling(false)
            setEnrolled(true);
        })
        .catch((err)=>console.log(err));
        // setEnrolling(false)
        // setDurationModal(false)
        // setEnrolled(true)
    }



    return(
        <>
        <div className="w-full h-full grid grid-rows-[min-content_1fr_min-content] grid-cols-4 gap-x-2">
            <div className="col-span-4 py-2 pr-4 flex flex-row w-full min-h-[10rem]">
                <div className="rounded-md h-full w-full relative bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] overflow-hidden">
                    {
                        course ?
                        <div className={`w-full h-full bg-cover rounded-t-md`}
                            style={{ backgroundImage: `url(${course.image_path})` }}>
                        </div> : null
                    }
                    {
                        course ?
                        <div className="absolute bg-gradient-to-t from-black via-black/80 to-transparent w-full h-full rounded-md p-4 flex flex-col gap-4 justify-between top-0 left-0">
                            <div>
                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.training_type?.charAt(0).toUpperCase()}{course?.training_type?.slice(1)}</span>
                                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit ml-2">{course.courseDuration} hours</span>
                            </div>
                            <div className="flex flex-col justify-end">
                                <h1 className='font-header text-2xl text-white'>{course.courseName}</h1>
                                <p className='font-text text-sm text-white'>{course.courseID} ({course.categories.category_name} - {course.career_level.name} Level)</p>
                            </div>
                        </div>
                        : <div className="absolute bg-gradient-to-t from-black via-black/80 to-transparent w-full h-full rounded-md p-4 flex flex-col gap-4 justify-end top-0 left-0">
                            <div className="flex flex-row items-center">
                                <FontAwesomeIcon icon={faSpinner}  className="text-3xl text-white animate-spin mr-3"/>
                                <p className="font-header text-3xl text-white">Loading...</p>
                            </div>
                        </div>

                    }
                </div>
            </div>
            {
                course ?
                <ScrollArea className="col-span-3 row-span-2  border border-divider rounded-md bg-white h-[calc(100vh-11rem)]">
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex flex-col gap-2 pb-4 border-b border-divider">
                            <p className="font-text text-xs text-unactive">Course Author:</p>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row gap-2">
                                    <div className="w-10 h-10 bg-primary rounded-full overflow-hidden">

                                        <img src={course.author.profile_image} alt="" className='rounded-full'/>
                                    </div>
                                    <div>
                                        <p className="font-text text-base">{course.author.first_name} {course.author.middle_name || ""} {course.author.last_name}</p>
                                        <p className="font-text text-xs text-unactive">ID: {course.author.employeeID}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-unactive text-xs">{course.author.user_credentials.MBemail}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pb-4 border-b border-divider">
                            <p className="font-header text-xl text-primary">Overview</p>
                            <p className="font-text text-xs">{course.overview}</p>
                        </div>
                        <div className="flex flex-col gap-2 pb-4">
                            <p className="font-header text-xl text-primary">Objective</p>
                            <p className="font-text text-xs">{course.objective}</p>
                        </div>
                    </div>
                </ScrollArea>
                :
                <div className="col-span-3  row-span-2 border border-divider rounded-md bg-white h-[calc(100vh-11rem)] animate-pulse">
                </div>
            }
            <div className="flex flex-col gap-2 pr-4">
                <p className="font-text text-xs text-unactive">What includes in the course</p>
                {
                    course ?
                    <div className="flex flex-col gap-2">
                        {
                            course.lessons.length != 0 ?
                            <div className="p-4 border bg-white rounded-md border-divider flex flex-row items-center text-primary">
                                <FontAwesomeIcon icon={faBookBookmark} className="mr-5 text-2xl"/>
                                <p>{course.lessons.length} Lesson Modules</p>
                            </div>
                            : null
                        }
                        {
                            course.attachments.length != 0 ?
                            <div className="p-4 border bg-white rounded-md border-divider flex flex-row items-center text-primary">
                                <FontAwesomeIcon icon={faFile} className="mr-5 text-2xl"/>
                                <p>{course.lessons.length} Attahcment Modules</p>
                            </div>
                            : null
                        }
                        {
                            course.tests.length != 0 ?
                            <div className="p-4 border bg-white rounded-md border-divider flex flex-row items-center text-primary">
                                <FontAwesomeIcon icon={faClipboard} className="mr-5 text-2xl"/>
                                <p>{course.tests.length} Assessment Modules</p>
                            </div>
                            : null
                        }
                    </div>:
                    <div className="flex flex-col gap-2">
                        {
                            Array.from({length: 3}).map((item)=>(
                                <div key={item} className="p-4 h-16 border bg-white rounded-md border-divider flex flex-row items-center text-primary animate-pulse">
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
            <div className="py-4 pr-4 flex flex-col gap-2">
                {/* <p className="font-text text-xs text-unactive">Enrollment Duration:</p>
                {
                    !course ? null :
                    course?.start_date && course?.end_date ?
                    <div className="flex flex-row justify-between items-center">
                        <div className='flex flex-row w-full gap-2'>
                            <div className='w-full'>
                                <p className='text-base font-header text-primary'>
                                        {format(course.start_date, "MMM dd yyyy")}
                                </p>
                                <p className='text-xs text-unactive font-text'>Starting Date:</p>
                            </div>
                            <div className='w-full'>
                                <p className='text-base font-header text-primary'>
                                        {format(course.end_date, "MMM dd yyyy")}
                                </p>
                                <p className='text-xs text-unactive font-text'>Ending Date:</p>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="flex flex-row justify-between items-center">
                        <div className='flex flex-row w-full gap-2'>
                            <div className='w-full'>
                                {
                                    date.from ?
                                    <p className='text-base font-header text-primary'>
                                        {format(date.from, "MMM dd yyyy")}
                                    </p>
                                    :
                                    <p className='text-base font-text text-unactive italic'>Select date</p>
                                }
                                <p className='text-xs text-unactive font-text'>Starting Date:</p>
                            </div>
                            <div className='w-full'>
                                {
                                    date.to ?
                                    <p className='text-base font-header text-primary'>
                                        {format(date.to, "MMM dd yyyy")}
                                    </p>
                                    :
                                    <p className='text-base font-text text-unactive italic'>Select date</p>
                                }
                                <p className='text-xs text-unactive font-text'>Ending Date:</p>
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
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                } */}
                <div className={`w-full h-fit p-4 bg-primary flex flex-row items-center justify-center font-header text-white rounded-md transition-all ease-in-out hover:cursor-pointer hover:bg-primaryhover `}
                    onClick={()=>{
                        //handleEnrollment()
                        setConfirm(true)
                    }}>
                    {
                        course?.start_date && course?.end_date ?
                        <p>Pending Enrollment</p>
                        : enrolling ?
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2"/>
                            <p>Creating Request</p>
                        </>
                        : <p>Request Enrollment</p>
                    }
                </div>
            </div>
        </div>

        <SelfEnrollmentSuccessfullyModal open={enrolled} close={()=> {setEnrolled(false);navigate(`/learner/learnerselfenrollment`)}} course={course}/>
        <SelfEnrollmentCourseConfirmation open={confirm} close={()=>{setConfirm(false)}} course={course} date={date} proceed={()=>{setConfirm(false); handleEnrollment()}}/>
        </>
    )
}
