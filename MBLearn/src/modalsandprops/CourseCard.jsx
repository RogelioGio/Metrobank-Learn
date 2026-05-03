import { faBookBookmark, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "../components/ui/hover-card";
import { useNavigate } from "react-router";
import { Progress } from "../components/ui/progress";
import { useEffect, useRef, useState } from "react";
import { RingProgress } from "@mantine/core";



const CourseCard = ({ course, type, click}) => {
    const [pos, setPos] = useState({x: 0, y: 0});
    const cardRef = useRef(null);
    // useEffect(() => {
    //         const handleMouseMove = (e) => {
    //             setPos({
    //                 x: e.clientX,
    //                 y: e.clientY
    //             })
    //         }

    //         window.addEventListener('mousemove', handleMouseMove);
    //         return () => {
    //             window.removeEventListener('mousemove', handleMouseMove);
    //         };
    // }, []);

    const handleMouseMove = (e) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }

    const handleMouseLeave = () => {
        setPos(null)
    }

    const navigate = useNavigate();

    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className={`group relative bg-white w-full h-full rounded-md shadow-md ${type === "profile_contentManager" || type === 'profile_journey' ? "hover:cursor-default" : "hover:cursor-pointer"} transition-all ease-in-out grid grid-rows-[1fr_min-content]`} onClick={click}
                    onMouseMove={handleMouseMove}
                    ref={cardRef}>

                        <div className={`relative md:rounded-t-md rounded-md grid grid-rows-[1fr_min-content] gap-2 ${type === 'general' ? '!rounded-md' : ''} bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] `}>
                                {/* style={{ backgroundImage: `url(${course.image_path})`, backgroundSize: 'cover', backgroundPosition: 'center', }} */}
                                {
                                    course.image_path !== "null" ?
                                    <div className={`w-full h-full bg-cover rounded-t-md`}
                                        style={{ backgroundImage: `url(${course.image_path})` }}>
                                    </div>
                                    : null
                                }

                        <div className={`absolute bg-gradient-to-t from-black via-black/80 to-transparent w-full h-full p-4 flex flex-col justify-between ${type === 'general' ? 'rounded-md' : 'rounded-md md:rounded-none '}`}>
                            <div className="flex flex-row justify-between items-start">
                                <div className={`flex flex-row gap-1 pb-2 w-full
                                                xl:flex-col lg:pb-0`}>
                                    <div className="flex flex-row justify-between w-full">
                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.training_type?.charAt(0).toUpperCase()}{course?.training_type?.slice(1)}</span>
                                        <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.courseDuration} hours</span>

                                    </div>
                                    {
                                         type === "learnerCourseManager" &&
                                         <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">{course?.enrollmentStatus?.charAt(0).toUpperCase()}{course?.enrollmentStatus?.slice(1)}</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h1 className='font-header text-sm text-white'>{course.courseName}</h1>
                                <p className='font-text text-xs text-white'>Course ID: {course.courseID}</p>
                            </div>
                            <div className={`absolute md:hidden group-hover:scale-100 scale-0 border border-primary rounded-md font-text p-2 w-fit text-xs transition-all ease-in-out bg-white shadow-md flex flex-col justify-between gap-1 z-10 pointer-events-none
                                            ${type === 'courseAdmin' ? "hidden" : type === 'learnerCourseManager' ? "hidden" :  type === 'general' || type === 'profile_contentManager' || type === 'profile_journey' ? "hidden" : ""}`}
                                        style={{
                                            left: pos?.x + 15,
                                            top: pos?.y,
                                        }}>
                                {
                                    type === "courseAdminCourseManager" ?
                                    <>
                                        <div className="w-full flex flex-col justify-between gap-2 whitespace-nowrap">
                                            <div className="w-full flex flex-row justify-between gap-2 whitespace-nowrap">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <div className="rounded-sm h-3 w-3 bg-primary"/>
                                                    <p className="text-unactive">On-going:</p>
                                                </div>
                                                <p>{course.ongoing}</p>
                                            </div>
                                            <div className="w-full flex flex-row justify-between gap-2 whitespace-nowrap">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <div className="rounded-sm h-3 w-3 bg-primary"/>
                                                    <p className="text-unactive">Due-soon:</p>
                                                </div>
                                                <p>{course.due_soon}</p>
                                            </div>
                                            <div className="w-full flex flex-row justify-between gap-2 whitespace-nowrap">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <div className="rounded-sm h-3 w-3 bg-primary"/>
                                                    <p className="text-unactive">Past-Due:</p>
                                                </div>
                                                <p>{course.past_due}</p>
                                            </div>
                                        </div>
                                    </> : type === "LearnerCourseManager" ?
                                    <>
                                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                                            <RingProgress
                                                size={35} // Diameter of the ring
                                                roundCaps
                                                thickness={4} // Thickness of the progress bar
                                                sections={[{ value: course.progress, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                                rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            />
                                            <div>
                                                <p className='font-header'>{course.progress}%</p>
                                                <p className='font-text text-xs'>Completion Progress</p>
                                            </div>
                                        </div>
                                    </> : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className={`${type === 'courseAdmin' ? 'p-4' : type === 'courseAdminCourseManager' ? 'md:px-4 md:py-3' : ''} relative`}>
                        {
                            type === 'courseAdmin' ? (
                                <div className="flex flex-row justify-between items-center">
                                    <p className="text-xs font-text text-unactive">On-going</p>
                                    <p className="test-xs font-text text-xs text-unactive"><span className="text-primary font-text text-xs">{course.ongoing}</span> Learners</p>
                                </div>
                            ) :
                            type === 'courseAdminCourseManager' ? (
                                <>
                                <div className="grid-cols-[1fr_min-content_1fr_min-content_1fr] gap-2 md:grid hidden">
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

                                </>
                            ) : type === 'learner' || type === 'learnerCourseManager' ? (
                                <div className="flex-col justify-between h-full py-3 px-4 md:flex hidden">
                                    <div className="flex flex-row justify-between font-text text-unactive text-xs pb-2">
                                        <p>Progress</p>
                                        <p>{Math.round((course?.doneModules?.length / course.modules)*100)} %</p>
                                    </div>
                                    <Progress value={Math.round((course?.doneModules?.length / course.modules)*100)}/>
                                </div>

                            ) : type === 'profile_contentManager' ? (
                                <div className="flex flex-col justify-between h-full gap-2 px-4 py-3">
                                    <div className="flex flex-row justify-between items-center text-xs font-text">
                                        <div className="flex gap-3 flex-row items-center">
                                            <div className="w-3 h-3 bg-primary rounded-sm"/>
                                            <p>On-going</p>
                                        </div>
                                        <p>{course.ongoing}</p>
                                    </div>
                                    <div className="flex flex-row justify-between gap-3 items-center text-xs font-text">
                                        <div className="flex gap-3 flex-row items-center">
                                            <div className="w-3 h-3 bg-primary rounded-sm"/>
                                            <p>Due-soon</p>
                                        </div>
                                        <p>{course.due_soon}</p>
                                    </div>
                                    <div className="flex flex-row justify-between gap-3 items-center text-xs font-text">
                                        <div className="flex gap-3 flex-row items-center">
                                            <div className="w-3 h-3 bg-primary rounded-sm"/>
                                            <p>Past-Due</p>
                                        </div>
                                        <p>{course.past_due}</p>
                                    </div>
                                </div>
                            )
                            : type === 'profile_journey' ? (
                                <div className="flex flex-row h-full gap-2 px-4 py-3">
                                    <RingProgress
                                                size={35} // Diameter of the ring
                                                roundCaps
                                                thickness={4} // Thickness of the progress bar
                                                sections={[{ value: course.progress, color: "hsl(218,97%,26%)" }]} // Lighter blue progress
                                                rootColor="hsl(210, 14%, 83%)" // Darker blue track
                                            />
                                    <div className="">
                                        <p className="font-header text-sm">{course.progress}%</p>
                                        <p className="font-text text-xs text-unactive">Course Progress Rate</p>
                                    </div>
                                </div>
                            )
                            : null
                        }
                    </div>
                </div>
            </HoverCardTrigger>
            {
                type === 'general' ? (
                    <HoverCardContent>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-unactive font-text">Course Contributor:</p>
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-8 h-8 rounded-full">
                                        <img src={course.adder?.profile_image} alt="" className="rounded-full" />
                                    </div>
                                    <div>
                                        <p className='text-xs font-text text-primary'>{course.adder?.first_name} course.{course.adder?.middle_name}  {course.adder?.last_name} {course.adder?.name_suffix} </p>
                                        <p className='text-xs font-text text-unactive'> ID: {course.adder?.employeeID} </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-unactive font-text">Course Author:</p>
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-8 h-8 rounded-full">
                                        <img src={course.adder?.profile_image} alt="" className="rounded-full" />
                                    </div>
                                    <div>
                                        <p className='text-xs font-text text-primary'>Author's Name </p>
                                        <p className='text-xs font-text text-unactive'> ID: 1023123 </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </HoverCardContent>
                ) : null
            }
        </HoverCard>
    )
}
export default CourseCard;
