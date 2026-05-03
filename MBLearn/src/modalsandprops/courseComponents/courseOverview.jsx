import { useEffect } from "react";
import { useState } from "react";
import axiosClient from "../../axios-client";
import { useParams } from "react-router-dom";
import { useCourse } from "MBLearn/src/contexts/selectedcourseContext";
import CourseLoading from "../../assets/Course_Loading.svg";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";

const CourseOveriew = ({course}) => {
    const [isLoading ,setLoading] = useState(false);


    return(
        // <div className="row-start-2 col-span-3">
        //     {/* Sample content but needed to be changes as props to be dynamic */}
        //     {
        //         !isLoading ? (
        //                 <div className="w-full h-full py-4 grid grid-cols-2 grid-row-2 pl-1">
        //                     <div className="col-span-2 row-span-1">
        //                         <p className="font-header text-primary">Course Description:</p>
        //                         <p className="font-text text-sm">{
        //                             isLoading ? "Loading..." : course?.overview || "No Course Description Found"
        //                             }</p>
        //                     </div>
        //                     {/* <div className="col-span-1 row-span-1 py-5">
        //                         <p className="font-header text-primary">Course Description:</p>
        //                         <p className="font-text text-sm">{
        //                             isLoading ? "Loading..." : course?.objective || "No Course Description Found"
        //                             }</p>
        //                     </div> */}
        //                     <div className="col-span-1 row-span-1 py-5">
        //                         <p className="font-header text-primary">Course Objecive:</p>
        //                         <p className="font-text text-sm">{
        //                             isLoading ? "Loading..." : course?.objective || "No Course Description Found"
        //                             }</p>
        //                     </div>
        //                 </div>
        //             ) : (
        //                 <div className="w-full h-full grid grid-cols-2 grid-row-2">
        //                     <div className="col-span-2 row-span-2 py-5 flex flex-col items-center justify-center">
        //                         <img src={CourseLoading} alt="Loading" className="w-80"/>
        //                         <p className="text-sm font-text text-primary">Hang tight! 🚀 Loading courses for — great things take a second!</p>
        //                     </div>
        //                 </div>
        //             )
        //     }

        // </div>
        <ScrollArea className="h-[calc(100vh-11rem)] border border-divider rounded-md bg-white">
            <div className="p-4 flex flex-col gap-2">
                <div className="w-full bg-primary rounded-md relative h-48">
                    {
                        course.image_path !== "null" ?
                        <img src={course.image_path} alt="" className="w-full h-full object-cover rounded-md"/>
                        : null
                    }
                    <div className="absolute justify-between flex flex-col bg-gray-950 bg-opacity-70 p-4 w-full top-0 left-0 h-full rounded-md">
                        <div className="flex flex-row justify-between items-start">
                            <span className="text-white border-white text-xs border w-fit py-1 px-4 rounded-md">{course.courseDuration} hours</span>
                            <p className="font-text text-xs text-white">{course.courseID}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white border-white text-xs border w-fit py-1 px-4 rounded-full">{course.training_type = "mandatory" ? "Mandatory" : "Non-Mandatory"}</span>
                            <p className="font-header text-white text-xl">{course.courseName}</p>
                            <p className="text-xs text-white">{course.categories.category_name} - {course.career_level.name} Level</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 border-b pb-4">
                    <p className="text-xs font-text text-unactive">Course Author:</p>
                    <div className="flex flex-row gap-4 items-center justify-between">
                        <div className="flex flex-row gap-4 items-center">
                            <div className="w-10 h-10 bg-primary rounded-full">
                                {
                                    course.author ?
                                    <img src={course.author.profile_image} alt="" className="w-full h-full object-cover rounded-full"/>
                                    : null
                                }
                                <img src="" alt="" />
                            </div>
                                <div className="flex flex-col leading-tight">
                                    <p className="text-primary font-header">{course.author.first_name} {course.author.middle_name || ""} {course.author.last_name}</p>
                                    <p className="text-xs text-unactive text-">ID: {course.author.employeeID}</p>
                                </div>
                        </div>
                        <div>
                            <p className="font-text text-xs text-unactive">{course.author.user_credentials.MBemail}</p>
                        </div>
                    </div>
                </div>
                              <div className="flex flex-col gap-2 border-b pb-4">
                <p className="font-header text-xl text-primary">Overview</p>
                <div
                    className="font-text text-xs text-unactive [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: course.overview }}
                />
                </div>

                <div className="flex flex-col gap-2">
                <p className="font-header text-xl text-primary">Objective</p>
                <div
                    className="font-text text-xs text-unactive [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: course.objective }}
                />
                </div>




            </div>
        </ScrollArea>
    );
}

export default CourseOveriew
