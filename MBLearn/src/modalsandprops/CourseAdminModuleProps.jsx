import { faCircleCheck as faCircleCheckRegular, faClipboard, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import CourseOverview from "../modalsandprops/courseComponents/CourseOverview";
import CourseText from "../modalsandprops/courseComponents/courseText";
import CourseVideo from "../modalsandprops/courseComponents/courseVideo";
import { faBackward, faBook, faChevronCircleLeft, faChevronCircleRight, faCircleChevronLeft, faCircleChevronRight, faFile, faForward, faPause, faRightFromBracket, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
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



const CourseAdminModuleProps = ({course, refresh}) => {
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
        max_attempt: test.max_attempt || 0,
        passing_percentage: test.passing_rate || 0,
    }))
    ]

    const sortedModules = modules.sort((a,b) => Number(a.currentOrderPosition) - Number(b.currentOrderPosition))

    return (
        <div className="relative">
        {
            course ?
            <Stepper key={course.id}  initialStep={0} enableStepClick={true}>
                {
                    course?.overview ? (
                        <Step stepTitle={"Course Overview"} stepDesc={"Quick Summary of the course"} icon={faBook} stepID={"overview"}>
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
                                content = <CourseVideo videoSrc={item.content} />;
                                break;
                            case "file":
                                content = <CourseText attachment={item}/>;
                                break;
                            case "assessment":
                                content = <CourseAssesmentManagement assessmentItem={item} refresh={()=>refresh()}/>;
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

        </div>
    )

}

export default CourseAdminModuleProps;
