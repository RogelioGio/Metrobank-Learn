import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import axiosClient from "MBLearn/src/axios-client";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { useEffect, useState } from "react";
import FontAwesome from "react-fontawesome";
import { useParams } from "react-router";

export function ReviewCourse() {
    const {course, setCourse} = useCreateCourse();
    const {setPageTitle,setShowBack} = useStateContext();
    const [approved ,setApproved] = useState(course?.CourseStatus === "reviewed");
    const {id} = useParams();

    setPageTitle("COURSE REVIEW");
    setShowBack(true);

    const fetchCourse = () => {
        axiosClient.get(`/getCourse/${id}`).then(({data}) => {
            setCourse(data);
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching course: ", error);
        })
    }

    const approveCourse = () => {
        axiosClient.put(`/setCourseReviewed/${id}`).then(({data}) => {
            setApproved(true);
        }).catch((error) => {
            console.error("Error approving course: ", error);
        })
    }


    useEffect(()=> {
        if(course) return;
        fetchCourse();
    },[course])

    return (
        <div className="w-full h-full grid grid-cols-4 gap-2">
            <div className="col-span-1 pb-4">
                <div className="h-full bg-white border shadow-md rounded-md flex flex-col items-center justify-between">
                    <div className="w-full">
                        <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] h-36 w-full rounded-t-sm flex flex-col items-center justify-center">
                            <div className="bg-gradient-to-b from-transparent to-black rounded-t-md w-full h-full flex flex-col justify-end p-4 text-white">
                                <p className="text-xs fon-text">Course name:</p>
                                <p className="font-header">{course?.CourseName}</p>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex flex-col">
                                <p className="text-xs font-text text-unactive">Department and Division:</p>
                                <p className="font-header text-primary">{course?.division.division_name}</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs font-text text-unactive">Category:</p>
                                <p className="font-header text-primary">{course?.category.category_name}</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs font-text text-unactive">Career Level:</p>
                                <p className="font-header text-primary">{course?.career_level.name} Level</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-text text-unactive">Author by:</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-header text-2xl">

                                    </div>
                                    <div>
                                        <p className="font-header text-primary">{course?.user_info.first_name} {course?.user_info.middle_name || ""} {course?.user_info.last_name}</p>
                                        <p className="text-xs font-text text-unactive">{course?.user_info.user_credentials.MBemail}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-2 p-4">
                        {
                            !approved &&
                            <div className="flex items-center justify-center w-full border-2 border-primary rounded-md py-2 bg-white text-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out ">
                                <p className="font-header">Subject for Revision</p>
                            </div>
                        }
                        <div className={`flex items-center justify-center w-full bg-primary rounded-md py-4 text-white hover:cursor-pointer transition-all ease-in-out ${approved ? "bg-green-900" : "hover:bg-primaryhover"}`}
                            onClick={() => {approveCourse()}}>
                                {
                                    approved ?
                                    <>
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl mr-2" />
                                    <p className="font-header">Course Approved</p>
                                    </>:
                                    <>
                                    <p className="font-header">Approve Course</p>
                                    </>
                                }
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-3 pb-4 pr-4">
                <div className="w-hull h-full bg-white rounded-md shadow-md p-4">

                </div>
            </div>
        </div>
    );
}
