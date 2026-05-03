import { faCircleCheck as faCircleCheckRegular, faClipboard, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import CourseOverview from "../modalsandprops/courseComponents/CourseOverview";
import CourseText from "../modalsandprops/courseComponents/courseText";
import CourseVideo from "../modalsandprops/courseComponents/courseVideo";
import { faBackward, faBook, faChevronCircleLeft, faChevronCircleRight, faCircleCheck, faCircleChevronLeft, faCircleChevronRight, faCircleXmark, faFile, faForward, faPause, faRightFromBracket, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Step, Stepper, StepperCompleted, useStepper } from "../components/ui/courseStepper";
import { ScrollArea } from "../components/ui/scroll-area";
import CourseAssesment from "./courseComponents/courseAssesment";
import Content from "./courseComponents/courseContent";
import courseCompleted from ".././assets/Course Completed.svg"
import { useStateContext } from "../contexts/ContextProvider";
import { Progress } from "../components/ui/progress";
import Course from "../views/Course";
import axiosClient from "../axios-client";
import Loading from "../assets/course_Loading.svg"
import CourseAssesmentManagement from "./CourseAssesmentManagement";
import { RingProgress } from "@mantine/core";
import { useParams } from "react-router";
import failed from "../assets/college entrance exam-amico.svg"



const CourseModuleProps = ({headers, course, LearnerProgress, setLearnerProgress, fetchingLearnerProgress, usedTo}) => {
    const stepperRef = useRef();
    const [activeStepMeta, setActiveMeta] = useState({title: "", desc: "", stepID:"", module:""})
    const {role,user} = useStateContext()
    const [loading, setLoading] = useState(false)
    const [miscProgress, setMiscProgress] = useState([])
    const [progress, setProgress] = useState(0)
    const [currentAssessmentResult, setCurrentAttemptResult] = useState({})
    const [enrollment_status, setEnrollment_Status] = useState()
    const [completing, setCompleting] = useState(true);
    const {id} = useParams()
    const [assessmentAttempts, setAssessmentAttempts] = useState({})
    const [exporting, setExporting] = useState(false)
    const [reasons, setReasons] = useState([])

    console.log(course?.enrollmentStatus)
    //New handleNext
    const getEnrollmentStatus = () => {
        setCompleting(true)
        axiosClient.get(`getEnrollmentStatus/${user.user_infos.id}/${course?.id}`)
        .then(({data}) => {
            setEnrollment_Status(data.enrollment_status)
            setCompleting(false)
        })
    }

    useEffect(()=>{
        console.log(course?.enrollmentStatus)
        setEnrollment_Status(course?.enrollmentStatus)
    },[course])

    useEffect(() => {
        if(enrollment_status === "failed"){
            handleFailedReason()
        }
    },[enrollment_status])

    useEffect(() => {
        if (usedTo === "Course Admin") return;
        calculateProgress()
    },[usedTo])

    let modules = [
    ...(course?.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        type: "lesson",
        name: lesson.lesson_name,
        currentOrderPosition: lesson.currentOrderPosition,
        content: lesson.lesson_content_as_json
    })),
    ...(course?.attachments ?? []).map((attachment) => ({
        id: attachment.id,
        type: attachment.FileName ? "file" : "video",
        name: attachment.FileName ? attachment.FileName : attachment.VideoName,
        currentOrderPosition: attachment.currentOrderPosition,
        content: attachment.FileName ? attachment.FilePath : attachment.VideoPath
    })),
    ...(course?.tests ?? []).map((test) => ({
        id: test.id,
        type: "assessment",
        name: test.TestName,
        currentOrderPosition: test.currentOrderPosition,
        content: test.questions,
        max_attempt: test.max_attempt,
        passing_percentage: test.passing_rate,
    }))
]

    const sortedModules = modules.sort((a,b) => Number(a.currentOrderPosition) - Number(b.currentOrderPosition))

        const calculateProgress = () => {
        if(role != "Learner") return
        if(!LearnerProgress) return 0
        console.log("completed modules:", LearnerProgress.length, "total modules:", sortedModules.length)
        const p =  (LearnerProgress.length / sortedModules.length) * 100
        setProgress(p)
    }


    const handleExportCert = () => {
        setExporting(true)
        axiosClient.get(`/getCert/${user.user_infos.id}/${course.id}`
            , {responseType: 'blob'})
        .then(({data}) => {
            const certificate = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(certificate);

            window.open(url);
            setExporting(false)
        })
        .catch((e) => console.log(e))
    }

    const handleFailedReason = () => {
        if(!course) return
        axiosClient.get(`getAllAssessmentResults/${course.id}`)
        .then(({data}) => {
            console.log(data)
            setReasons(data)
        })
        .catch((e) => console.log(e))
    }
    useEffect(() => {
        //console.log("Learner Progress:", LearnerProgress.length)
    },[sortedModules, course])

    // useEffect(()=>{
    //     if(!course)return
    //     getEnrollmentStatus()
    // },[course])

    return (
        <>
        {
            // !course ?
            // <div className="flex items-center justify-center h-full w-full gap-4">
            //     {/* <FontAwesomeIcon icon={faSpinner} className="animate-spin"/> */}
            //     <p className="text-unactive font-text text-xs">Loading Content...</p>
            // </div>
            usedTo === "Course Admin"  ?
            <>
                {
                    course ?
                    <Stepper initialStep={0} enableStepClick={true} ref={stepperRef} onStepChange={(index,meta) => setActiveMeta(meta)}>
                        {
                            course?.overview ? (
                                <Step stepTitle={"Course Overview"} stepDesc={"Quick Summary of the course"} icon={faBook} stepID={"overview"}>
                                    <CourseOverview course={course}/>
                                </Step>
                            ) : (null)
                        }
                        {
                            sortedModules.splice(1).map((item, index) => {
                                let content;
                                switch (item.type) {
                                    case "lesson" :
                                        content = <Content  course={item.content}/>;
                                        break;
                                    case "video":
                                        content = <CourseVideo videoSrc={item.content} />;
                                        break;
                                    case "file":
                                        content = <CourseText fileSrc={item.content} />;
                                        break;
                                    case "assessment":
                                        content = <CourseAssesmentManagement questions={item.content} />;
                                        break;
                                    default:
                                        content = (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="font-text text-primary text-sm">No Content Available</p>
                                        </div>
                                        );

                                }

                                return (
                                <Step key={index} stepTitle={item.name} icon={item.type === "assessment" ? faClipboard : ""} stepDesc={`This is the ${item.name} short description`} stepID={item.id} >
                                    {content}
                                </Step>
                                );
                            })
                        }
                        {/* <Step stepTitle={"Course Assessment"} stepDesc={"This is the course assessment"} icon={faClipboard} stepID={"assessment"}>
                            <CourseAssesmentManagement />
                        </Step> */}
                    </Stepper>
                    :
                    <div className="w-full h-full grid grid-cols-[20rem_1fr] items-center justify-center gap-2">
                        <div className="w-full h-full flex flex-col gap-2 pb-4">
                            <p className="text-xs font-text text-unactive">Course Content:</p>
                            <div className="w-full h-full rounded-md border border-divider bg-white flex flex-col gap-2 p-4  ">
                                <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                                <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                                <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex flex-col h-full w-full">
                            <div className="pb-2 pt-1 flex flex-row pr-4 h-fit w-full justify-between">
                                <div className="flex flex-col gap-1 ">
                                    <p className="text-unactive font-text text-xs">Current Content Title:</p>
                                    <div className="font-header text-primary text-lg h-[2rem] w-60 bg-gray-400 rounded-md animate-pulse"></div>
                                </div>
                                <div className="flex flex-row gap-x-1">
                                    <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50`}>
                                        <FontAwesomeIcon icon={faChevronCircleLeft}/>
                                    </div>
                                    <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50`}>
                                        <FontAwesomeIcon icon={faChevronCircleRight}/>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[calc(100vh-11.4rem)] border border-divider bg-white rounded-md mr-4"></div>
                        </div>
                    </div>
                }
            </>
            : <>
                {
                    course ?
                    <Stepper initialStep={progress === 100 ? sortedModules.length+1 : LearnerProgress.length} enableStepClick={true} ref={stepperRef} onStepChange={false} LearnerProgress={LearnerProgress || []}  completionPercent={progress} isLoading={loading}  currentAssementStatus={assessmentAttempts}  getEnrollmentStatus={getEnrollmentStatus} currentEnrollmentStatus={enrollment_status}>
                    {
                        course?.overview ? (
                            <Step stepTitle={"Course Overview"} stepDesc={"Quick Summary of the course"} icon={faBook} stepID={sortedModules[0].id} stepModule={'lesson'}>
                                <CourseOverview course={course}/>
                            </Step>
                        ) : (null)
                    }

                    {
                        sortedModules?.slice(1).map((item, index) => {
                            let content;
                            switch (item.type) {
                                case "lesson" :
                                    content = <Content  course={item.content}/>;
                                    break;
                                case "video":
                                    content = <CourseVideo videoSrc={item.content}/>;
                                    break;
                                case "file":
                                    content = <CourseText attachment={item} />;
                                    break;
                                case "assessment":
                                    content = <CourseAssesment test={item} setCurrentAttemptResult={setCurrentAttemptResult} gettingCurrentAttempt={setLoading} setAttempts={setAssessmentAttempts}/>
                                    break;
                                default:
                                    content = (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="font-text text-primary text-sm">No Content Available</p>
                                    </div>
                                    );

                            }

                            return (
                            <Step key={index} stepTitle={item.name} icon={item.type === "assessment" ? faClipboard : ""} stepDesc={`This is the ${item.name} short description`} stepID={item.id} stepModule={item.type}>
                                {content}
                            </Step>
                            );
                        })
                    }
                    <StepperCompleted>
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                            {
                                enrollment_status === "failed" ?
                                <>
                                    <div className="flex-col flex items-center">
                                        <img src={failed} alt="Course Completed" className="w-20"/>
                                        <div className="flex flex-col items-center">
                                            <p className="font-header text-3xl text-primary">Not your best, but it’s not over!</p>
                                            <p className="font-text text-xs text-center text-unactive px-4">You have failed to completed the course.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ">
                                        <div className="flex flex-col items-center">
                                            <p className="text-unactive text-xs">Course Completion Remarks</p>
                                            <div className="flex flex-row gap-4 text-3xl text-red-700 items-center justify-center">
                                                <FontAwesomeIcon icon={faCircleXmark} className=""/>
                                                <p className="font-header">Failed</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-text text-xs text-center text-unactive px-4">
                                        <p>This isn’t the end of your learning journey! You’re now marked for <span className="font-header">course re-enrollment.</span></p>
                                        <p>Your Course Admins may able you to retake the course and continue your progress. </p>
                                        <p>Keep going — you’re one step closer to success!</p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full items-center">
                                        <p className="text-xs text-unactive">Possible reason for course failure:</p>
                                        {
                                            reasons.length === 0 ? null :
                                            reasons.map((reason) => (
                                                <div key={reason.id} className="flex flex-row gap-5 border border-primary p-4 rounded-md min-w-[12rem] bg-white shadow-md w-fit">
                                                    <div className="">
                                                        <p className="font-text text-xs text-unactive">Assessment Name:</p>
                                                        <p className="font-header">{reason.AssessmentName}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="font-text text-xs text-unactive">Remarks:</p>
                                                        {
                                                            reason.Remarks === "Passed" ?
                                                            <div className="flex flex-row gap-1 text-xl text-green-900 items-center">
                                                                <FontAwesomeIcon icon={faCircleCheck} className=""/>
                                                                <p className="font-header">Passed</p>
                                                            </div>
                                                            :<div className="flex flex-row gap-1 text-xl text-red-700 items-center">
                                                                <FontAwesomeIcon icon={faCircleXmark} className=""/>
                                                                <p className="font-header">Failed</p>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                                :
                                enrollment_status === "finished" ?
                                <>
                                    <div className="flex-col flex items-center">
                                        <img src={courseCompleted} alt="Course Completed" className="w-20"/>
                                        <div className="flex flex-col items-center">
                                            <p className="font-header text-3xl text-primary">Congratulations!</p>
                                            <p className="font-text text-xs text-center text-unactive px-4">You have successfully completed the course.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ">
                                        <div className="flex flex-col items-center">
                                            <p className="text-unactive text-xs">Course Completion Remarks</p>
                                            <div className="flex flex-row gap-4 text-3xl text-primary items-center justify-center">
                                                <FontAwesomeIcon icon={faCircleCheck} className=""/>
                                                <p className="font-header">Passed!</p>
                                            </div>
                                        </div>

                                        <p className="text-unactive text-xs text-center">The learner is qualified and certified to complete the course by completing all <br/> prequisites and modules of the course</p>
                                    </div>
                                    <div>
                                        <div className={`flex flex-row gap-4 items-center justify-center p-4 px-8  rounded-md text-white bg-primary transition-all ease-in-out shadow-md ${exporting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-primaryhover hover:text-white"}`}
                                            onClick={()=>{
                                                if(exporting) return
                                                handleExportCert()
                                            }}>
                                            {
                                                exporting ?
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                :
                                                <FontAwesomeIcon icon={faFile}/>
                                            }
                                            <p className="font-header">Export Certificate</p>
                                        </div>
                                    </div>
                                </>
                                :
                                <>
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-primary"/>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <p className="text-xl font-header text-primary">Completing Course</p>
                                            <p className="text-xs text-unactive">Please wait and we are completing your learning journey</p>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </StepperCompleted>


                </Stepper>
                :
                    <div className="w-full h-full grid grid-cols-[20rem_1fr] items-center justify-center gap-2">
                        <div className="w-full h-full flex flex-col gap-2">
                            <div className="h-fit flex flex-row justify-between items-center p-4 gap-2 border-divider border rounded-md bg-white">
                                <div>
                                    <RingProgress
                                            size={50} // Diameter of the ring
                                            roundCaps
                                            thickness={8} // Thickness of the progress bar
                                            sections={[{ value: 0, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                            rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                        />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <p className="text-xs font-text text-unactive">Course Progress</p>
                                    <div className="font-text text-primary text-sm h-[2rem] w-[10rem] bg-gray-400 animate-pulse rounded-md"></div>
                                </div>
                            </div>
                            <div className="h-full pb-4 flex flex-col gap-2">
                                <div className="w-full h-full rounded-md border border-divider bg-white flex flex-col gap-2 p-4  ">
                                    <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                                    <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                                    <div className="h-20 border-divider border w-full rounded-md bg-white shadow-md animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col h-full w-full">
                            <div className="pb-2 pt-1 flex flex-row pr-4 h-fit w-full justify-between items-center">
                                <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50`}>
                                    <FontAwesomeIcon icon={faChevronCircleLeft}/>
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center ">
                                    <p className="text-unactive font-text text-xs">Current Content Title:</p>
                                    <div className="font-header text-primary text-lg h-[2rem] w-64 bg-gray-400 rounded-md animate-pulse"></div>
                                </div>
                                <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50 `}>
                                    <FontAwesomeIcon icon={faChevronCircleRight}/>
                                </div>
                            </div>

                            {/* <div className="pb-2 pt-1 flex flex-row pr-4 h-fit w-full justify-between">
                            `   <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50`}>
                                    <FontAwesomeIcon icon={faChevronCircleLeft}/>
                                </div>`
                                <div className="flex flex-col gap-1 ">
                                    <p className="text-unactive font-text text-xs">Current Content Title:</p>
                                    <div className="font-header text-primary text-lg h-[2rem] w-60 bg-gray-400 rounded-md animate-pulse"></div>
                                </div>
                                <div className={`w-10 h-10 text-lg border-2 border-primary rounded-md flex justify-center items-center text-primary  transition-all ease-in-out shadow-md opacity-50`}>
                                    <FontAwesomeIcon icon={faChevronCircleRight}/>
                                </div>
                            </div> */}
                            <div className="h-[calc(100vh-10.2rem)] border border-divider bg-white rounded-md mr-4 animate-pulse"></div>
                        </div>
                    </div>

                }
            </>
        }
        </>

    )

};

export default CourseModuleProps;
