import { faBookOpenReader, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosClient from "MBLearn/src/axios-client";
import { useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext"
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import AddAssignCourseAdmin from "MBLearn/src/modalsandprops/AddAssignCourseAdmin";
import AssignCourseAdmin from "MBLearn/src/modalsandprops/AssignCourseAdminModal";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export function TobeDistributedCourse() {
    const {setPageTitle} = useStateContext();
    const {course, setCourse} = useCreateCourse();
    const {id} = useParams();
    const [openAssign, setOpenAssign] = useState(false);

    const getCourse = () => {
        axiosClient.get(`/getCourse/${id}`)
        .then(({data}) => {
            console.log("Course Data: ", data)
            setCourse(data);
        })
        .catch((error) => {
            console.error("There was an error fetching the course data!", error);
        });
    }

    useEffect(() => {
        if(course) return
        getCourse();
    },[])

    setPageTitle("Course Details");

    return (
        <>
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] gap-2 w-full h-full mr-4">
            <div className="col-start-1 row-start-1 col-span-3">
                <div className="border rounded-md">
                    <div className="rounded-md bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] h-full">
                        {/* Image Here */}
                        <div className="bg-gradient-to-b from-transparent to-black rounded-md">
                            <div className="p-4 flex flex-row justify-end">
                                <div className="w-10 h-10 rounded-md border-2 border-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-primary text-white transition-colors">
                                    <FontAwesomeIcon icon={faCircleInfo} />
                                </div>
                            </div>

                            <div className="p-4 w-full h-full text-white flex flex-col justify-end  rounded-md">
                                <div>
                                    <p className="font-text text-xs">Course Name:</p>
                                    <p className="font-header text-2xl">{course?.CourseName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-start-1 row-start-2 mb-4">
                <div className="w-full h-full border bg-white shadow-md rounded-md p-4 flex flex-col gap-2">

                </div>
            </div>

            <div className="col-start-2 col-span-2 row-start-2 mb-4">
                <div className="w-full h-full border bg-white shadow-md rounded-md p-4 flex flex-col gap-2">

                </div>
            </div>

            <div className="col-span-1 row-span-2 mb-4 mr-4 flex flex-col gap-2">
                <div className="flex flex-col gap-1 w-full">
                    <p className="font-header text-xl text-primary leading-none">Course Assignment List</p>
                    <p className="font-text text-xs text-unactive">Assigning course admins to thier respective courses.</p>
                </div>
                <div className="h-full border bg-white shadow-md rounded-md p-4 flex flex-col gap-2 overflow-y-auto">
                    {/* object here */}
                    <div className="w-full items-center p-4 border-2 border-primary rounded-md flex flex-row gap-2 bg-white shadow-md">
                        <div className="max-w-10 max-h-10 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-header text-2xl">
                        </div>
                        <div>
                            <p className="font-header text-sm text-primary">Juan Dela Cruz</p>
                            <p className="font-text text-xs">Department-Division</p>
                        </div>
                    </div>
                    <div className="w-full items-center p-4 border-2 border-primary rounded-md flex flex-row gap-2 bg-white shadow-md">
                        <div className="max-w-10 max-h-10 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-header text-2xl">
                        </div>
                        <div>
                            <p className="font-header text-sm text-primary">Juan Dela Cruz</p>
                            <p className="font-text text-xs">Department-Division</p>
                        </div>
                    </div>
                    <div className="w-full items-center p-4 border-2 border-primary rounded-md flex flex-row gap-2 bg-white shadow-md">
                        <div className="max-w-10 max-h-10 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-header text-2xl">
                        </div>
                        <div>
                            <p className="font-header text-sm text-primary">Juan Dela Cruz</p>
                            <p className="font-text text-xs">Department-Division</p>
                        </div>
                    </div>
                </div>
                <div className="shadow-md flex flex-row gap-2 items-center justify-center bg-primary w-full rounded-md text-white font-header text-center py-4 cursor-pointer hover:bg-primaryhover ease-in-out transition-all"
                    onClick={() => setOpenAssign(true)}>
                    <FontAwesomeIcon icon={faBookOpenReader} />
                    <p>Assign Course Admin</p>
                </div>
            </div>

        </div>

        <AddAssignCourseAdmin courseID={course?.id} open={openAssign} close={()=> setOpenAssign(false)}/>
        </>
    )
}
