import { faCircleCheck as faCircleCheckRegular, faCircleLeft as faCircleLeftRegular } from "@fortawesome/free-regular-svg-icons"
import { faArrowDownShortWide, faArrowDownZA, faArrowLeft, faArrowUpAZ, faArrowUpWideShort, faBook, faBookBookmark, faBookOpenReader, faBookReader, faCakeCandles, faChalkboard, faChalkboardUser, faCircle, faCircleInfo, faClipboard, faClipboardUser, faFile, faFileContract, faFileImport, faGraduationCap, faPencil, faPenToSquare, faPersonCircleCheck, faPieChart, faSort, faSpinner, faSquareCheck, faTrash, faTruckMonster, faUser, faUserCircle, faUserGraduate, faUserGroup, faUserPlus, faUserTie } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stepper } from "@mantine/core"
import React, { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useNavigate, useParams } from "react-router-dom"
import axiosClient from "../axios-client"
import { useStateContext } from "../contexts/ContextProvider"
import CourseOverview from "../modalsandprops/courseComponents/CourseOverview"
import CourseText from "../modalsandprops/courseComponents/courseText"
import CourseVideo from "../modalsandprops/courseComponents/courseVideo"
import CourseModuleProps from "../modalsandprops/CourseModuleProps"
import CourseLearenerProps from "../modalsandprops/CourseLearnerProps"
import CourseEnrollmentProps from "../modalsandprops/CourseEnrollmentProps"
import { use } from "react"
import EditCourseModal from "../modalsandprops/EditCourseModal"
import { format, set } from "date-fns"
import AssignCourseAdmin from "../modalsandprops/AssignCourseAdminModal"
import dayjs from "dayjs"
import CourseLoading from "../assets/Course_Loading.svg"
import CourseDetailsModal from "../modalsandprops/CourseDetailsModal"
import CourseCourseAdminAssignmentProps from "../modalsandprops/CourseCourseAdminAssigmentProps"
import AddAssignCourseAdmin from "../modalsandprops/AddAssignCourseAdmin"
import CoursePublishingModal from "../modalsandprops/CoursePublishingModal"
import { useCourse } from "../contexts/Course"
import CourseReport from "../modalsandprops/CourseReport"
import CourseAdminModuleProps from "../modalsandprops/CourseAdminModuleProps"
import EnrollmentApproval from "../modalsandprops/EnrollmentApproval"
import { toast } from "sonner"


export default function Course() {
    const navigate = useNavigate();
    const {role, user} = useStateContext();
    const {id} = useParams();
    const [isLoading ,setLoading] = useState(false);
    const [tab, setTab] = useState("module");
    const [open, setOpen] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [openPublish, setOpenPublish] = useState(false);
    const [assign, setAssign] = useState(false);
    const {course, setCourse} = useCourse()
    const [learnerProgress, setLearnerProgress] = useState();
    const [fetchingLearnerProgress, setFethingLearnerProgress] = useState();
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if(!isLoading){
            const savedTab = localStorage.getItem(`course_${id}_tab`);
            if (savedTab) {
                setTab(savedTab);
            }
        }
    },[isLoading, course]);
    useEffect(()=>{
        if(!isLoading && course){
            localStorage.setItem(`course_${id}_tab`, tab);
        }
    },[tab])
    useEffect(() => {
        return () => {
            localStorage.removeItem(`course_${id}_tab`);
        };
    }, [])

    useEffect(() => {
        //Records recently opened course;
        if(course){
            role ==="Course Admin" ?
            axiosClient.post(`/records/${course?.id}`).then((res) => {
                //console.log("Recorded recently opened course");
            }).catch((e) => {
                //console.log("Error recording recently opened course:", e);
            })
            :
            axiosClient.post(`learner/records/${course?.id}`).then((res) => {
                //console.log("Recorded recently opened course");
            }).catch((e) => {
                //console.log("Error recording recently opened course:", e);
            })
        }
    },[course, id])

    const fetchCourse  = () => {
        setLoading(true)
        setCourse(null)
        axiosClient.get(`/coursecontext/${id}`)
        .then((res) => {
            //console.log(res.data);
            setCourse(res.data)
            setLoading(false);
        })
        .catch((e) => {
            toast.error("You are not assigned in this course.");
            navigate("/");
        })
    }

    const fetchLearnerCourse = () => {
        setLoading(true)
        axiosClient.get(`/coursecontext/${id}/${user.user_infos.id}`)
        .then((res) => {
            setCourse(res.data)
            setLoading(false)
            setLearnerProgress(res.data.doneModules)
            console.log((res.data.doneModules.length / res.data.modules_count) * 100);
        }).catch((e) => {
            toast.error("You are not enrolled in this course.");
            navigate("/");
        })
    }

    const handleAppealArchival = () => {
        if(processing) return;
        setProcessing(true);

        axiosClient.post(`/course/reject-archival/${course?.archival_date?.id}`)
        .then((res) => {
            setProcessing(false);
            fetchCourse();
            toast.success("Successfully appealed the archival of the course.");
        })
        .catch((e) => {
            setProcessing(false);
            toast.error("Failed to appeal the archival of the course.");
            console.log(e);
        })

        // setTimeout(() => {
        //     setProcessing(false);
        //     fetchCourse();
        //     toast.success("Successfully appealed the archival of the course.");
        // }, 2000);
    }

    useEffect(()=>{
        //console.log('the corse is passed is:', course || "none");
        setLearnerProgress(course?.doneModules || [])
        if(role==="Learner" && !course){
            //console.log("Learner Po SYA")
            fetchLearnerCourse()
            setLearnerProgress(course?.doneModules || [])
        }else if((role==="Course Admin" && !Object.keys(course || {}).length > 0) || course?.id !== Number(id)){
            fetchCourse()
        }
    },[role, id, course])

    const tabComponents = {
        module: <CourseAdminModuleProps course={course} refresh={()=>{fetchCourse()}}/>,
        learner: <CourseLearenerProps course={course}/>,
        enrollment: <CourseEnrollmentProps course={course}/>,
        report: <CourseReport course={course}/>
    };

    return(
        <div className="relative h-full">
        <div className={`grid ${role === "Course Admin" ? "grid-cols-4 grid-rows-[min-content_1fr]" : role === "Learner" ? "grid-cols-4 grid-rows-[min-content_1fr]" : null} h-full`}>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | {isLoading ? "Loading..." : course?.courseName || "No Course Found"}</title>
            </Helmet>

            {/* Header */}
            <div className="flex flex-row justify-between col-span-4">
                <div className="py-2 flex flex-row gap-4 items-center">
                    <div className="min-w-10 min-h-10 h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primaryhover hover:cursor-pointer hover:text-white transition-all ease-in-out text-lg text-primary" onClick={()=>navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </div>
                    <div className="w-full whitespace-nowrap ">
                        {course ? <>
                            <div className="flex flex-row gap-2">
                                <span className="text-xs bg-primarybg rounded-md border-primary text-primary py-1 px-2 border">{course.training_type === 'mandatory' ? "Mandatory"  : "Non-mandatory"}</span>
                            </div>
                            <p className="font-header text-primary text-xl">{course.courseName}</p>
                            <p className="text-xs">{course.categories?.category_name} - {course.career_level?.name} Level</p></>
                        :
                            <>
                                <div className="w-full flex flex-col gap-1">
                                    <div className="h-[1rem] w-16 animate-pulse rounded-sm bg-gray-400"></div>
                                    <div className="h-[2rem] w-60 animate-pulse rounded-sm bg-gray-400"></div>
                                    <div className="h-[1rem] w-20 animate-pulse rounded-sm bg-gray-400"></div>
                                </div>
                            </>
                        }
                    </div>
                </div>
                {
                    role === "Course Admin" || !course ?
                    <div className="flex flex-row gap-2 items-center pr-4">
                        {
                            course ?
                            <>
                            <div className={`border-2 border-primary flex-row flex py-2 px-4 rounded-md items-center justify-center gap-2 hover:cursor-pointer transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white ${tab === "module" ? "bg-primary text-white" : "bg-white text-primary" }`} onClick={()=>setTab("module")}>
                            <FontAwesomeIcon icon={faFile} className=""/>
                            <p className="text-sm font-header">Contents</p>
                            </div>
                            <div className={`border-2 border-primary flex-row flex py-2 px-4 rounded-md items-center justify-center gap-2 hover:cursor-pointer transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white ${tab === "learner" ? "bg-primary text-white" : "bg-white text-primary" }`}  onClick={()=>setTab("learner")}>
                                <FontAwesomeIcon icon={faUserGraduate} className=""/>
                                <p className="text-sm font-header">Learners</p>
                            </div>
                            {
                                user.user_infos.permissions?.some((permission)=> permission.id === 16) && (course?.status !== "for_archival" || course.status === "archived") ?
                                <div className={`border-2 border-primary flex-row flex py-2 px-4 rounded-md items-center justify-center gap-2 hover:cursor-pointer transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white ${tab === "enrollment" ? "bg-primary text-white" : "bg-white text-primary" }`}  onClick={()=>setTab("enrollment")}>
                                    <FontAwesomeIcon icon={faPersonCircleCheck} className=""/>
                                    <p className="text-sm font-header">Enrollments</p>
                                </div> : null
                            }
                            <div className={`border-2 border-primary flex-row flex py-2 px-4 rounded-md items-center justify-center gap-2 hover:cursor-pointer transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover hover:text-white ${tab === "report" ? "bg-primary text-white" : "bg-white text-primary" }`}  onClick={()=>setTab("report")}>
                                <FontAwesomeIcon icon={faPieChart} className=""/>
                                <p className="text-sm font-header">Reports</p>
                            </div>
                            </> : null
                        }
                    </div> :
                    <div className="flex flex-row gap-2 items-center pr-4">
                        <div className="flex flex-col items-end">
                            <p className="font-text text-xs text-unactive">Training Deadline</p>
                            {
                                course?.deadline ?
                                <p className="font-header text-primary">{format(new Date(course?.deadline), "MMMM dd yyyy")}</p>
                                : <div className="h-[1rem] w-16 animate-pulse rounded-sm bg-gray-400"></div>
                            }
                        </div>
                    </div>
                }
            </div>



            {

                false ? null
                : role === "Course Admin" ? (
                    <>
                        <div className="lg:hidden flex col-span-4 row-span-1 mx-2 flex-row gap-1 p-1 border border-primary rounded-md shadow-md bg-white font-text text-primary text-xs justify-between">
                            <div className={`flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out ${tab === "module" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`} onClick={()=> setTab("module")}>
                                Content
                            </div>
                            <div className={`w-full flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out ${tab === "learner" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`} onClick={()=> setTab("learner")}>
                                Learner
                            </div>
                            <div className={`w-full flex items-center justify-center px-4 py-2 rounded-md hover:cursor-pointer transition-all ease-in-out ${tab === "report" ? "bg-primary text-white" : "text-primary hover:cursor-pointer hover:bg-primarybg"}`} onClick={()=> setTab("report")}>
                                Reports
                            </div>
                        </div>

                        <div className="col-span-4 pr-4">
                            {tabComponents[tab] || null}
                        </div>
                    </>
                )
                : role === "Learner" ?
                    <div className="col-span-4">
                        <CourseModuleProps course={course} LearnerProgress={course?.doneModules || learnerProgress} setLearnerProgress={setLearnerProgress} fetchingLearnerProgress={fetchingLearnerProgress} />
                    </div>
                : null

            }
        </div>
        {
            // && course?.status === "for_archival"
            !isLoading && course && role === "Course Admin" && course.archival_date !== null && course.hasOwnProperty("archival_date") ?
            <div className="w-full h-fit absolute  bottom-0 left-0 p-4 pr-8">
                <div className="bg-red-200 border border-red-900 shadow-md rounded-md p-4 text-white font-text text-sm flex flex-row justify-between items-center">
                    <div className="text-red-900">
                        <p className="font-header">Course Archival Notice</p>
                        <p className="font-text text-xs">This course named <span className="font-header">{course.courseName}</span> is set to be archived on date <span className="font-header">{course?.archival_date?.WillArchiveAt ? format(new Date(course.archival_date.WillArchiveAt), 'MMMM dd yyyy') : null}</span> </p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-row gap-2 items-center bg-red-900 px-4 py-2 rounded-md hover:cursor-pointer hover:bg-red-800 transition-all ease-in-out"
                            onClick={()=>handleAppealArchival()}>
                            {
                                processing ?
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white"/>
                                    <p className="font-header text-sm">Processing...</p>
                                </>
                                :
                                <>
                                    <FontAwesomeIcon icon={faFileImport} className="text-white"/>
                                    <p className="font-header text-sm">Appeal Archival</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div> : null
        }
        </div>

    )
}
